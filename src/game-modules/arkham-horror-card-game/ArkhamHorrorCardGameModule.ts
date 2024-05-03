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
  IPackMetadata,
} from "../GameModule";
import { properties } from "./properties";
import { packList as arkhamPackList } from "./generated/packsList";
import log from "loglevel";
import { GameType } from "../GameType";
import SetData from "./generated/sets.json";
import Packs from "../../external/arkhamdb-json-data/packs.json";
import Cycles from "../../external/arkhamdb-json-data/cycles.json";

interface ArkhamCard {
  code: string;
  cost: number;
  deck_limit: number;
  name: string;
  pack_code: string;
  quantity: number;
  type_code: string;
  double_sided?: boolean;
  duplicate_of?: string;
  cycle_code?: string;
  encounter_code?: string;
}

export default class ArkhamHorrorCardGameModule extends GameModule {
  constructor() {
    super(properties, {}, {}, {}, []);
  }
  getSetData(): ISetData {
    const setData = {} as ISetData;
    SetData.forEach((set) => {
      const packForSet = Packs.find((p) => p.code === set.pack_code);

      const cycleForSet = Cycles.find((c) => c.code === packForSet?.cycle_code);

      setData[set.code] = {
        name: set.name,
        setTypeCode: cycleForSet?.name ?? "Unknown",
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
      const mappedCardData: CardData = {
        code: cardArkhamFormat.code,
        octgnId: "",
        name: cardArkhamFormat.name,
        images: {
          front: `https://arkhamdb.com/bundles/cards/${cardArkhamFormat.code}.png`,
          back: cardArkhamFormat.double_sided
            ? `https://arkhamdb.com/bundles/cards/${cardArkhamFormat.code}b.png`
            : "https://cf.geekdo-images.com/erRoLUaNt05c5Kd_9Oj86A__imagepagezoom/img/5IfbG6qVdSH85KACxaaoBHxutKU=/fit-in/1200x900/filters:no_upscale():strip_icc()/pic3311650.png",
        },
        quantity: cardArkhamFormat.quantity,
        doubleSided: !!cardArkhamFormat.double_sided,
        backLink: null,
        typeCode: cardArkhamFormat.type_code,
        subTypeCode: null,
        extraInfo: {
          setCode: cardArkhamFormat.encounter_code ?? null,
          packCode: cardArkhamFormat.pack_code,
          factionCode: "",
        },
        duplicate_of: cardArkhamFormat.duplicate_of,
      };
      return mappedCardData;
    });
  }
  parseDecklist(
    _response: AxiosResponse<any, any>,
    _state: RootState
  ): [string[], ILoadedDeck] {
    throw new Error("Method not implemented.");
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
    const temp = groupBy<CardData>(
      encounterCards,
      (e) => e.extraInfo.loadOrder
    );
    return Object.values(temp);
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
