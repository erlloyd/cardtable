import axios, { AxiosResponse } from "axios";
import log from "loglevel";
import { CardSizeType } from "../../constants/card-constants";
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
import { GameType } from "../GameType";
import { packList as legendaryPackList } from "./generated/packsList";
import { properties } from "./properties";
import { v4 } from "uuid";
import { makeBasicPlayerBoard } from "../../utilities/playerboard-utils";
import { IPlayerBoard } from "../../features/cards/initialState";
import { packList } from "../../generated/packsList";
import setList from "./external/downloadedSetData/sets.json";
import startCase from "lodash.startcase";

interface MarvelLegendaryCard {
  name: string;
  imageUrl: string;
  rarity?: number;
  qtd?: number;
}

interface MarvelLegendaryCardWithId {
  id: number;
  name: string;
  imageUrl: string;
  qtd?: number;
  cards?: [
    {
      qtd: number;
    }
  ];
}

interface MarvelLegendaryHero {
  id: number;
  name: string;
  filterName: string;
  cards: MarvelLegendaryCard[];
}

interface MarvelLegendaryCardGroup {
  id: number;
  name: string;
  filterName?: string;
  cards: MarvelLegendaryCard[];
}

interface MarvelLegendaryPack {
  id: number;
  heroes: MarvelLegendaryHero[];
  masterminds?: MarvelLegendaryCardGroup[];
  henchmen?: MarvelLegendaryCardWithId[];
  villains?: MarvelLegendaryCardGroup[];
  schemes?: MarvelLegendaryCardWithId[];
  bystanders?: MarvelLegendaryCardWithId[];
  starterdeck?: MarvelLegendaryHero[];
  misc?: MarvelLegendaryCardWithId[];
  packName: string;
}

export default class MarvelLegendaryGameModule extends GameModule {
  constructor() {
    super(properties, {}, {}, {}, []);
  }

  getSetData(): ISetData {
    const setData: ISetData = {};
    setList.forEach((set) => {
      setData[set.name] = {
        name: set.name,
        cardsInSet: [],
        setTypeCode: set.setTypeCode,
      };
    });
    return setData;
  }
  async getCardsData(): Promise<ILoadCardsData[]> {
    let resultsList = await Promise.all(
      legendaryPackList.map((pack) => getSpecificPack(pack))
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
          packType: GameType.MarvelLegendary,
          pack: r.res.data as any,
          pack_code: r.packCode,
        };
      });
    return [];
  }
  async getEncounterSetData(): Promise<ILoadEncounterSetData[]> {
    return [];
  }
  checkIsPlayerPack(_packCode: string): boolean {
    return false;
  }
  convertCardDataToCommonFormat(packWithMetadata: {
    pack: any;
    metadata: IPackMetadata;
  }): CardData[] {
    const pack = packWithMetadata.pack as MarvelLegendaryPack;
    let cards = [] as CardData[];

    pack.heroes.forEach((h) => {
      cards = cards.concat(
        h.cards.map((c) => {
          let quantity = 1;
          if (c.rarity === 1) {
            quantity = 5;
          } else if (c.rarity === 2) {
            quantity = 3;
          } else if (c.rarity === 3) {
            quantity = 1;
          }

          return {
            code: `${pack.packName}_${h.filterName || h.name}_${c.name}`,
            name: `${c.name}`,
            images: {
              front: c.imageUrl,
              back: "/images/from_modules/marvel-legendary/marvel-legendary-card_back.png",
            },
            octgnId: null,
            quantity,
            doubleSided: false,
            backLink: null,
            typeCode: "hero",
            subTypeCode: null,
            extraInfo: {
              campaign: false,
              setCode: `${pack.packName}_heroes_${h.filterName || h.name}`,
              packCode: "TODO - legendary",
              setType: null,
              factionCode: null,
              sizeType: CardSizeType.Standard,
            },
          };
        })
      );
    });

    pack.masterminds?.forEach((h) => {
      cards = cards.concat(
        h.cards.map((c) => {
          return {
            code: `${pack.packName}_${h.name}_${c.name}`,
            name: `${c.name}`,
            images: {
              front: c.imageUrl,
              back: "/images/from_modules/marvel-legendary/marvel-legendary-card_back.png",
            },
            octgnId: null,
            quantity: 1,
            doubleSided: false,
            backLink: null,
            typeCode: "mastermind",
            subTypeCode: null,
            extraInfo: {
              campaign: false,
              setCode: `${pack.packName}_masterminds_${h.name}`,
              packCode: "TODO - legendary",
              setType: null,
              factionCode: null,
              sizeType: CardSizeType.Standard,
            },
          };
        })
      );
    });

    pack.henchmen?.forEach((h) => {
      cards = cards.concat([
        {
          code: `${pack.packName}_${h.name}`,
          name: `${h.name}`,
          images: {
            front: h.imageUrl,
            back: "/images/from_modules/marvel-legendary/marvel-legendary-card_back.png",
          },
          octgnId: null,
          quantity: 10,
          doubleSided: false,
          backLink: null,
          typeCode: "henchmen",
          subTypeCode: null,
          extraInfo: {
            campaign: false,
            setCode: `${pack.packName}_henchmen_${h.name}`,
            packCode: "TODO - legendary",
            setType: null,
            factionCode: null,
            sizeType: CardSizeType.Standard,
          },
        },
      ]);
    });

    pack.villains?.forEach((h) => {
      cards = cards.concat(
        h.cards.map((c) => {
          let quantity = c.qtd || 1;

          return {
            code: `${pack.packName}_${h.filterName || h.name}_${c.name}`,
            name: `${c.name}`,
            images: {
              front: c.imageUrl,
              back: "/images/from_modules/marvel-legendary/marvel-legendary-card_back.png",
            },
            octgnId: null,
            quantity,
            doubleSided: false,
            backLink: null,
            typeCode: "villain",
            subTypeCode: null,
            extraInfo: {
              campaign: false,
              setCode: `${pack.packName}_villains_${h.filterName || h.name}`,
              packCode: "TODO - legendary",
              setType: null,
              factionCode: null,
              sizeType: CardSizeType.Standard,
            },
          };
        })
      );
    });

    pack.schemes?.forEach((h) => {
      cards = cards.concat([
        {
          code: `${pack.packName}_${h.name}`,
          name: `${h.name}`,
          images: {
            front: h.imageUrl,
            back: "/images/from_modules/marvel-legendary/marvel-legendary-card_back.png",
          },
          octgnId: null,
          quantity: 1,
          doubleSided: false,
          backLink: null,
          typeCode: "scheme",
          subTypeCode: null,
          extraInfo: {
            campaign: false,
            setCode: `${pack.packName}_schemes_${h.name}`,
            packCode: "TODO - legendary",
            setType: null,
            factionCode: null,
            sizeType: CardSizeType.Standard,
          },
        },
      ]);
    });

    pack.bystanders?.forEach((h) => {
      cards = cards.concat([
        {
          code: `${pack.packName}_${h.name}`,
          name: `${h.name}`,
          images: {
            front: h.imageUrl,
            back: "/images/from_modules/marvel-legendary/marvel-legendary-card_back.png",
          },
          octgnId: null,
          quantity: h.cards?.at(0)?.qtd || 1,
          doubleSided: false,
          backLink: null,
          typeCode: "bystander",
          subTypeCode: null,
          extraInfo: {
            campaign: false,
            setCode: `${pack.packName}_bystanders_${h.name}`,
            packCode: "TODO - legendary",
            setType: null,
            factionCode: null,
            sizeType: CardSizeType.Standard,
          },
        },
      ]);
    });

    pack.starterdeck?.forEach((h) => {
      cards = cards.concat(
        h.cards.map((c) => {
          let quantity = c.qtd || 1;

          return {
            code: `${pack.packName}_${h.filterName || h.name}_${c.name}`,
            name: `${c.name}`,
            images: {
              front: c.imageUrl,
              back: "/images/from_modules/marvel-legendary/marvel-legendary-card_back.png",
            },
            octgnId: null,
            quantity,
            doubleSided: false,
            backLink: null,
            typeCode: "starterdeck",
            subTypeCode: null,
            extraInfo: {
              campaign: false,
              setCode: `${pack.packName}_starter_${h.filterName || h.name}`,
              packCode: "TODO - legendary",
              setType: null,
              factionCode: null,
              sizeType: CardSizeType.Standard,
            },
          };
        })
      );
    });

    pack.misc?.forEach((h) => {
      cards = cards.concat([
        {
          code: `${pack.packName}_${h.name}`,
          name: `${h.name}`,
          images: {
            front: h.imageUrl,
            back: "/images/from_modules/marvel-legendary/marvel-legendary-card_back.png",
          },
          octgnId: null,
          quantity: h.qtd || 1,
          doubleSided: false,
          backLink: null,
          typeCode: "misc",
          subTypeCode: null,
          extraInfo: {
            campaign: false,
            setCode: `${pack.packName}_misc_${h.name}`,
            packCode: "TODO - legendary",
            setType: null,
            factionCode: null,
            sizeType: CardSizeType.Standard,
          },
        },
      ]);
    });

    return cards;
  }

  parseDecklist(
    _response: AxiosResponse<any, any>,
    _state: RootState
  ): [string[], ILoadedDeck] {
    throw new Error("Method not implemented.");
  }

  getEncounterEntitiesFromState(
    allSetData: ISetData,
    _herosData: ICardData,
    encounterEntities: ICardData
  ): IEncounterEntity[] {
    const setCodes: { [key: string]: CardData[] } = {};

    Object.values(encounterEntities).forEach((card) => {
      const setCode = card.extraInfo.setCode || "unknown";
      if (!!setCodes[setCode]) {
        setCodes[setCode].push(card);
      } else {
        setCodes[setCode] = [card];
      }
    });

    // make a map of what we want to display for sets to check for duplicates
    const duplicateNames: { [key: string]: boolean } = {};

    Object.keys(setCodes).forEach((sc) => {
      const name = sc.split("_")[2];
      if (duplicateNames[name] === undefined) {
        duplicateNames[name] = false;
      } else {
        duplicateNames[name] = true;
      }
    });

    const toReturn = Object.keys(setCodes).map((setCode) => {
      const data = allSetData[setCode];
      const splitName = setCode.split("_");
      const mainName = splitName[2];
      const packName = startCase(splitName[0]);

      let displayName = mainName;
      if (duplicateNames[mainName]) {
        displayName = `${mainName} (${packName})`;
      }
      return {
        setCode,
        setData: { ...allSetData[setCode], name: displayName },
        cards: setCodes[setCode],
      } as IEncounterEntity;
    });

    // Go through and get the original index of every "type" of set
    const originalOrder = toReturn.reduce((orderMap, entity, index) => {
      if (orderMap[entity.setData.setTypeCode] === undefined) {
        orderMap[entity.setData.setTypeCode] = index;
      }

      return orderMap;
    }, {} as { [key: string]: number });

    return toReturn.sort(
      (a, b) =>
        originalOrder[a.setData.setTypeCode] -
        originalOrder[b.setData.setTypeCode]
    );
  }

  splitEncounterCardsIntoStacksWhenLoading(
    _setCode: string,
    encounterCards: CardData[]
  ): CardData[][] {
    let returnCards: CardData[] = [];
    encounterCards.forEach((ec) => {
      returnCards = returnCards.concat(
        Array.from({ length: ec.quantity }).map((_i) => ec)
      );
    });
    return [returnCards];
  }
}

const getSpecificPack = async (
  packName: string
): Promise<{ res: AxiosResponse<MarvelLegendaryPack>; packCode: string }> => {
  const response = await axios.get<MarvelLegendaryPack>(
    "/json_data/" + packName
  );
  return {
    res: response,
    packCode: packName.split(".json")[0],
  };
};
