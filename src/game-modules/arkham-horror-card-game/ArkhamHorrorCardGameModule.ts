import axios, { AxiosResponse } from "axios";
import { groupBy } from "lodash";
import { CardData } from "../../external-api/common-card-data";
import { IEncounterEntity } from "../../features/cards-data/cards-data.selectors";
import { ICardData, ISetData } from "../../features/cards-data/initialState";
import { RootState } from "../../store/rootReducer";
import {
  GameModule,
  ILoadCardsData,
  ILoadEncounterSetData,
  ILoadedDeck,
  ILoadedDeckMetadata,
  IPackMetadata,
  filterAndExpand,
} from "../GameModule";
import { properties } from "./properties";
import { packList as arkhamPackList } from "./generated/packsList";
import log from "loglevel";
import { GameType } from "../GameType";
import SetData from "./generated/sets.json";
import Packs from "../../external/arkhamdb-json-data/packs.json";
import Cycles from "../../external/arkhamdb-json-data/cycles.json";
import { ArkhamDeckData, getArkhamCards } from "./getArkhamCards";
import { Vector2d } from "konva/lib/types";
import { v4 } from "uuid";

interface ArkhamCard {
  code: string;
  cost: number;
  deck_limit: number;
  name: string;
  pack_code: string;
  quantity: number;
  type_code: string;
  subtype_code?: string;
  double_sided?: boolean;
  duplicate_of?: string;
  cycle_code?: string;
  encounter_code?: string;
  faction_code: string;
}

export default class ArkhamHorrorCardGameModule extends GameModule {
  constructor() {
    super(properties, {}, {}, {}, ["agenda", "act", "investigator"]);
  }
  getSetData(): ISetData {
    const setData = {} as ISetData;
    SetData.forEach((set) => {
      const packForSet = Packs.find((p) => p.code === set.pack_code);

      const cycleForSet = Cycles.find((c) => c.code === packForSet?.cycle_code);

      let setTypeCode = cycleForSet?.name ?? "Unknown";
      if (set.isScenario) {
        setTypeCode = `${setTypeCode} - Scenarios`;
      } else {
        setTypeCode = `${setTypeCode} - Sets`;
      }

      setData[set.code] = {
        name: set.name,
        setTypeCode,
        cardsInSet: [],
      };
    });

    return setData;
  }
  async getCardsData(): Promise<ILoadCardsData[]> {
    let resultsList = await Promise.all(
      arkhamPackList.map((pack) => getSpecificArkhamPack(pack))
    );

    let failed = resultsList.filter((r) => r.res.status !== 200);
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
          packType: GameType.ArkhamHorrorCardGame,
          pack: r.res.data as any,
          pack_code: r.packCode,
        };
      });
  }
  async getEncounterSetData(): Promise<ILoadEncounterSetData[]> {
    return [];
  }
  checkIsPlayerPack(packCode: string): boolean {
    return (
      !packCode.includes("_encounter") &&
      !(packCode === "tskc") &&
      !(packCode === "fhvc")
    );
  }
  convertCardDataToCommonFormat(packWithMetadata: {
    pack: any;
    metadata: IPackMetadata;
  }): CardData[] {
    const arkhamPack = packWithMetadata.pack as ArkhamCard[];
    return arkhamPack.map((cardArkhamFormat) => {
      let cardFront = `https://arkhamdb.com/bundles/cards/${cardArkhamFormat.code}.png`;
      if (
        cardArkhamFormat.double_sided &&
        cardArkhamFormat.type_code === "location"
      ) {
        cardFront = `https://arkhamdb.com/bundles/cards/${cardArkhamFormat.code}b.png`;
      }

      let cardBack =
        "https://cf.geekdo-images.com/erRoLUaNt05c5Kd_9Oj86A__imagepagezoom/img/5IfbG6qVdSH85KACxaaoBHxutKU=/fit-in/1200x900/filters:no_upscale():strip_icc()/pic3311650.png";

      if (cardArkhamFormat.double_sided) {
        if (cardArkhamFormat.type_code === "location") {
          cardBack = `https://arkhamdb.com/bundles/cards/${cardArkhamFormat.code}.png`;
        } else {
          cardBack = `https://arkhamdb.com/bundles/cards/${cardArkhamFormat.code}b.png`;
        }
      } else if (cardArkhamFormat.faction_code === "mythos") {
        cardBack =
          "https://cf.geekdo-images.com/oW7K1XsgHSf7g-qiqd_T1A__imagepage/img/HyIcISpk-Wd33AkCjR7bN0s_WPM=/fit-in/900x600/filters:no_upscale():strip_icc()/pic5595580.jpg";
      }

      const mappedCardData: CardData = {
        code: cardArkhamFormat.code,
        octgnId: "",
        name: cardArkhamFormat.name,
        images: {
          front: cardFront,
          back: cardBack,
        },
        quantity: cardArkhamFormat.quantity,
        doubleSided: !!cardArkhamFormat.double_sided,
        backLink: null,
        typeCode: cardArkhamFormat.type_code,
        subTypeCode: cardArkhamFormat.subtype_code ?? null,
        extraInfo: {
          setCode: cardArkhamFormat.encounter_code ?? null,
          packCode: cardArkhamFormat.pack_code,
          factionCode: cardArkhamFormat.faction_code,
        },
        duplicate_of: cardArkhamFormat.duplicate_of,
      };
      return mappedCardData;
    });
  }
  parseDecklist(
    response: AxiosResponse<any, any>,
    state: RootState,
    payload: { gameType: GameType; decklistId: number; position: Vector2d }
  ): [string[], ILoadedDeck, ILoadedDeckMetadata] {
    const returnCards = getArkhamCards(response, state, payload);
    const codes = [returnCards.data.investigator_code];

    const data = response.data as ArkhamDeckData;
    const displayName = `${data.name} (${payload.decklistId})`;
    return [
      codes,
      returnCards,
      {
        displayName,
        relatedTokens: [
          {
            code: `${payload.decklistId}-investigator-token`,
            controlledBy: null,
            faceup: true,
            imgUrl: `https://arkhamdb.com/bundles/cards/${returnCards.data.investigator_code}.png`,
            id: v4(),
            crop: { x: 0, y: 50, width: 200, height: 200 },
            position: { x: 0, y: 0 },
          },
        ],
      },
    ];
  }
  getEncounterEntitiesFromState(
    setData: ISetData,
    _herosData: ICardData,
    encounterEntities: ICardData
  ): IEncounterEntity[] {
    const setTypesEncounters: { [key: string]: CardData[] } = {};

    Object.values(encounterEntities)
      .sort((a, b) => (a.code < b.code ? -1 : a.code > b.code ? 1 : 0))
      .forEach((encounterCard) => {
        const setCode = encounterCard.extraInfo.setCode || "unknown";
        if (!!setTypesEncounters[setCode]) {
          setTypesEncounters[setCode].push(encounterCard);
        } else {
          setTypesEncounters[setCode] = [encounterCard];
        }
      });

    const setDataToReturn = Object.entries(setTypesEncounters)
      .filter(([key, _value]) => key !== "unknown")
      .map(([key, value]) => {
        const shouldSortCardsBySetPosition = value.every(
          (c) => !!c.extraInfo.setPosition !== undefined
        );

        if (!setData[key]) {
          console.error("Couldn't find set data for " + key);
        }

        return {
          setCode: key,
          setData: setData[key],
          cards: shouldSortCardsBySetPosition
            ? value.sort(
                (a, b) =>
                  (a.extraInfo.setPosition ?? 0) -
                  (b.extraInfo.setPosition ?? 0)
              )
            : value,
        };
      });

    // Go through and get the original index of every "type" of set
    const originalOrder = setDataToReturn.reduce((orderMap, entity, index) => {
      if (orderMap[entity.setData.setTypeCode] === undefined) {
        orderMap[entity.setData.setTypeCode] = index;
      }

      return orderMap;
    }, {} as { [key: string]: number });

    return setDataToReturn.sort(
      (a, b) =>
        originalOrder[a.setData.setTypeCode] -
        originalOrder[b.setData.setTypeCode]
    );
  }

  splitEncounterCardsIntoStacksWhenLoading(
    _setCode: string,
    encounterCards: CardData[]
  ): CardData[][] {
    const scenarioStack = filterAndExpand(
      encounterCards,
      (c) => c.typeCode === "scenario"
    );
    const agendaStack = filterAndExpand(
      encounterCards,
      (c) => c.typeCode === "agenda"
    );
    const actStack = filterAndExpand(
      encounterCards,
      (c) => c.typeCode === "act"
    );
    const locationStack = filterAndExpand(
      encounterCards,
      (c) => c.typeCode === "location"
    );
    const remainingStack = filterAndExpand(
      encounterCards,
      (c) =>
        c.typeCode !== "scenario" &&
        c.typeCode !== "agenda" &&
        c.typeCode !== "act" &&
        c.typeCode !== "location"
    );

    const splitStacks = [
      scenarioStack,
      agendaStack,
      actStack,
      locationStack,
      remainingStack,
    ];
    return splitStacks.filter((stack) => stack.length > 0);
  }

  isCardBackImg(imgUrl: string): boolean {
    return (
      imgUrl.indexOf("pic5595580") !== -1 || imgUrl.indexOf("pic3311650") !== -1
    );
  }
}

const getSpecificArkhamPack = async (
  packName: string
): Promise<{ res: AxiosResponse<ArkhamCard[]>; packCode: string }> => {
  const response = await axios.get<ArkhamCard[]>(
    "/json_data/from_modules/arkhamhorrorcardgame/" + packName
  );
  return {
    res: response,
    packCode: packName.split(".json")[0],
  };
};
