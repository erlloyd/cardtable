import axios, { AxiosResponse } from "axios";
import { Vector2d } from "konva/lib/types";
import log from "loglevel";
import {
  CardData as CardDataLOTR,
  CardPack as CardPackLOTR,
  Scenario,
} from "../../external-api/beorn-json-data";
import { CardData } from "../../external-api/common-card-data";
import {
  default as Scenarios,
  default as scenarioListLOTR,
} from "../../external/ringsteki-json-data/scenarios.json";
import { IEncounterEntity } from "../../features/cards-data/cards-data.selectors";
import { ICardData, ISetData } from "../../features/cards-data/initialState";
import { packList as lotrPackList } from "../../generated/packsList_lotr";
import { RootState } from "../../store/rootReducer";
import {
  GameModule,
  ILoadCardsData,
  ILoadEncounterSetData,
  ILoadedDeck,
  ILoadedDeckMetadata,
  IPackMetadata,
} from "../GameModule";
import { GameType } from "../GameType";
import { getLOTRCards } from "./getLOTRCards";
import { loadEncounterEntities } from "./loadEncounterEntities";
import { MISSING_BACK_IMAGE_MAP } from "./missing-images";
import { properties } from "./properties";

export default class LOTRLCGGameModule extends GameModule {
  constructor() {
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

      if (!cardLOTRFormat.Front || !cardLOTRFormat.Front.ImagePath) {
        console.log(`No Front`, cardLOTRFormat);
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
  ): [string[], ILoadedDeck, ILoadedDeckMetadata] {
    const displayName = `${response.data.name} (${payload.decklistId})`;
    const returnCards = getLOTRCards(response, state, payload);
    return [[], returnCards, { displayName }];
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
