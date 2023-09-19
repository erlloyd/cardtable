import {
  CounterTokenType,
  StatusTokenType,
} from "../../constants/card-constants";
import { ICardData, ISetData } from "../../features/cards-data/initialState";
import {
  GameModule,
  GameProperties,
  ILoadCardsData,
  ILoadEncounterSetData,
  ILoadedDeck,
  IPackMetadata,
} from "../GameModule";
import Scenarios from "../../external/ringsteki-json-data/scenarios.json";
import { packList as lotrPackList } from "../../generated/packsList_lotr";
import log from "loglevel";
import axios, { AxiosResponse } from "axios";
import {
  CardPack as CardPackLOTR,
  CardData as CardDataLOTR,
  Scenario,
} from "../../external-api/beorn-json-data";
import scenarioListLOTR from "../../external/ringsteki-json-data/scenarios.json";
import { CardData } from "../../external-api/common-card-data";
import { MISSING_BACK_IMAGE_MAP } from "./missing-images";
import { RootState } from "../../store/rootReducer";
import { Vector2d } from "konva/lib/types";
import { getLOTRCards } from "./getLOTRCards";
import { IEncounterEntity } from "../../features/cards-data/cards-data.selectors";
import { loadEncounterEntities } from "./loadEncounterEntities";
import { GameType } from "../GameType";

export default class LOTRLCGGameModule extends GameModule {
  constructor() {
    const properties: GameProperties = {
      deckSite: "ringsdb.com",
      decklistApi: "https://ringsdb.com/api/public/decklist/",
      allowSpecificCardSearch: true,
      decklistSearchApi: "https://ringsdb.com/decklists/find",
      decklistSearchApiConstants: "numcores=3&sort=likes",
      encounterUiName: "Scenario",
      initialPlaymatImageLocation: "/images/table/background_lotrlcg.jpg",
      possibleIcons: [
        {
          iconId: "tactics",
          iconName: "Tactics",
          iconImageUrl: "/images/standard/lotr/tactics.png",
        },
        {
          iconId: "leadership",
          iconName: "Leadership",
          iconImageUrl: "/images/standard/lotr/leadership.png",
        },
        {
          iconId: "spirit",
          iconName: "Spirit",
          iconImageUrl: "/images/standard/lotr/spirit.png",
        },
        {
          iconId: "lore",
          iconName: "Lore",
          iconImageUrl: "/images/standard/lotr/lore.png",
        },
      ],
      modifiers: [
        {
          attributeId: "threat",
          attributeName: "Threat",
          icon: "/images/standard/lotr/threat.png",
          slot: 1,
        },
        {
          attributeId: "willpower",
          attributeName: "Willpower",
          icon: "/images/standard/lotr/willpower.png",
          slot: 2,
        },
        {
          attributeId: "attack",
          attributeName: "Attack",
          icon: "/images/standard/lotr/attack.png",
          slot: 3,
        },
        {
          attributeId: "defense",
          attributeName: "Defense",
          icon: "/images/standard/lotr/defense.png",
          slot: 4,
        },
        {
          attributeId: "hitpoints",
          attributeName: "Hit Points",
          icon: "/images/standard/lotr/hitpoints.png",
          slot: 5,
        },
      ],
      tokens: {
        stunned: {
          canStackMultiple: false,
          tokenType: StatusTokenType.Stunned,
          touchMenuLetter: "Q",
          menuText: "Quest",
          menuRemoveText: "Remove From Quest",
          imagePath: "/images/standard/quest.png",
        },
        confused: null,
        tough: null,
        damage: {
          counterTokenType: CounterTokenType.Damage,
          isNumeric: true,
          touchMenuLetter: "Dmg",
          menuText: "Set Damage",
          imagePath: "/images/standard/damage_lotr.png",
        },
        threat: {
          counterTokenType: CounterTokenType.Threat,
          isNumeric: true,
          touchMenuLetter: "Prg",
          menuText: "Set Progress",
          imagePath: "/images/standard/progress.png",
        },
        generic: {
          counterTokenType: CounterTokenType.Generic,
          isNumeric: true,
          touchMenuLetter: "Res",
          menuText: "Set Resource Tokens",
          imagePath: "/images/standard/resource.png",
        },
        acceleration: null,
      },
    };
    super(properties, {}, {}, {}, ["quest", "player_side_quest"]);
  }

  getSetData(): ISetData {
    const setData = {} as ISetData;
    Scenarios.forEach((scenario) => {
      setData[scenario.Slug] = {
        name: scenario.Title,
        setTypeCode: scenario.Product,
        cardsInSet: [],
      };
    });

    return setData;
  }

  async getCardsData(): Promise<ILoadCardsData[]> {
    const resultsList = await Promise.all(
      lotrPackList.map((pack) => getSpecificLOTRPack(pack))
    );

    const failed = resultsList.filter((r) => r.res.status !== 200);
    if (failed.length > 0) {
      log.error(
        "Failed to load some JSON data:",
        failed.map((r) => r.packCode)
      );
    }

    return resultsList
      .filter((r) => r.res.status === 200)
      .map((r) => {
        return {
          packType: GameType.LordOfTheRingsLivingCardGame,
          pack: r.res.data as any,
          pack_code: r.packCode,
        };
      });
  }

  async getEncounterSetData(): Promise<ILoadEncounterSetData[]> {
    const resultsListLOTRScenarios = await Promise.all(
      scenarioListLOTR.map((scenario) =>
        getSpecificLOTRScenario(scenario.Title)
      )
    );

    const failedScenario = resultsListLOTRScenarios.filter(
      (r) => r.status !== 200
    );
    if (failedScenario.length > 0) {
      log.error(
        "Failed to load some JSON data:",
        failedScenario.map((r) => r.data.Slug)
      );
    }

    return resultsListLOTRScenarios.map((r) => {
      return {
        gameType: GameType.LordOfTheRingsLivingCardGame,
        setCode: r.data.Slug,
        cards: r.data.AllCards,
      };
    });
  }

  checkIsPlayerPack(_packCode: string): boolean {
    return true;
  }

  convertCardDataToCommonFormat(packWithMetadata: {
    pack: any;
    metadata: IPackMetadata;
  }): CardData[] {
    const lotrPack = packWithMetadata.pack as CardPackLOTR;
    return lotrPack.cards.map((cardLOTRFormat) => {
      let cardBackImage = cardLOTRFormat.Back?.ImagePath;

      if (cardLOTRFormat.Back && !cardLOTRFormat.Back.ImagePath) {
        const frontImage = cardLOTRFormat.Front.ImagePath;
        const frontImageWithoutExtension = frontImage
          .split(".")
          .slice(0, -1)
          .join(".");
        if (
          frontImageWithoutExtension[frontImageWithoutExtension.length - 1] !==
          "A"
        ) {
          if (MISSING_BACK_IMAGE_MAP[cardLOTRFormat.RingsDbCardId]) {
            cardBackImage =
              MISSING_BACK_IMAGE_MAP[cardLOTRFormat.RingsDbCardId];
          } else {
            log.warn(
              `No Non-B Back Image Path for ${cardLOTRFormat.Slug} from ${cardLOTRFormat.CardSet}`,
              cardLOTRFormat.RingsDbCardId
            );
          }
        } else {
          cardBackImage = frontImage.replaceAll("A.", "B.");
        }
      }

      const mappedCardData: CardData = {
        code: packWithMetadata.metadata.encounterPack
          ? cardLOTRFormat.Slug
          : getCardCodeIncludingOverrides(cardLOTRFormat),
        name: cardLOTRFormat.Title,
        images: {
          front: cardLOTRFormat.Front.ImagePath,
          back: cardBackImage ?? null,
        },
        octgnId: cardLOTRFormat.OctgnGuid ?? null,
        quantity: cardLOTRFormat.Quantity ?? 1,
        doubleSided: !!cardLOTRFormat.Back,
        backLink: null,
        typeCode: cardLOTRFormat.CardType,
        subTypeCode: cardLOTRFormat.CardSubType,
        extraInfo: {
          campaign: cardLOTRFormat.CAMPAIGN,
          setCode: cardLOTRFormat.CardSet ?? null,
          packCode: "TODO - lotr",
          setType: packWithMetadata.metadata.setType,
          factionCode: packWithMetadata.metadata.encounterPack
            ? "encounter"
            : "player",
        },
      };
      return mappedCardData;
    });
  }

  parseDecklist(
    response: AxiosResponse<any, any>,
    state: RootState,
    payload: { gameType: GameType; decklistId: number; position: Vector2d }
  ): [string[], ILoadedDeck] {
    const returnCards = getLOTRCards(response, state, payload);
    return [[], returnCards];
  }

  getEncounterEntitiesFromState(
    setData: ISetData,
    herosData: ICardData,
    encounterEntities: ICardData
  ): IEncounterEntity[] {
    return loadEncounterEntities(setData, herosData, encounterEntities);
  }
}

// Helper methods
export const getCardCodeIncludingOverrides = (card: CardDataLOTR): string => {
  let code = card.RingsDbCardId;
  if (Object.keys(cardDataSetCodeOverride).includes(card.CardSet)) {
    code = cardDataSetCodeOverride[card.CardSet](card.RingsDbCardId);
  }
  return code;
};

export const cardDataSetCodeOverride: { [key: string]: (s: string) => string } =
  {
    "The Gap of Rohan": (code: string) => {
      let returnCode = code;
      if (!!code && code[0] === "0") {
        returnCode = `303${code.substring(2)}`;
      }
      return returnCode;
    },
    "Blood in the Isen": (code: string) => {
      let returnCode = code;
      if (!!code && code[0] === "0") {
        returnCode = `306${code.substring(2)}`;
      }
      return returnCode;
    },
  };

const getSpecificLOTRPack = async (
  packName: string
): Promise<{ res: AxiosResponse<CardPackLOTR>; packCode: string }> => {
  const response = await axios.get<CardPackLOTR>("/json_data/" + packName);
  return {
    res: response,
    packCode: packName.split(".json")[0],
  };
};

const getSpecificLOTRScenario = async (
  scenario: string
): Promise<AxiosResponse<Scenario>> => {
  const response = await axios.get<Scenario>(
    "/json_data/scenarios/" + scenario + ".json"
  );
  return response;
};
