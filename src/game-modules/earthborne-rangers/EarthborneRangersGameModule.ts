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
  NumericTokenInfo,
  TokensInfo,
} from "../GameModule";
import { GameType } from "../GameType";
import { packList as ebrPackList } from "./generated/setList_earthborne-rangers";
import { properties } from "./properties";
import setList from "./external/sets/sets.json";
import { ICardStack } from "../../features/cards/initialState";
import { GamePropertiesMap } from "../../constants/game-type-properties-mapping";

interface EBRCard {
  name: string;
  code: string;
  qtd?: number;
  frontImage: string;
  backImage: string;
  setType: string;
  set: string;
}

type EBRPack = EBRCard[];

export default class EarthborneRangersGameModule extends GameModule {
  constructor() {
    super(properties, {}, {}, {}, ["location"]);
  }

  getSetData(): ISetData {
    const setData: ISetData = {};
    setList.forEach((type) => {
      type.sets.forEach((s) => {
        setData[s.id] = {
          name: s.name,
          cardsInSet: [],
          setTypeCode: type.name,
        };
      });
    });
    return setData;
  }
  async getCardsData(): Promise<ILoadCardsData[]> {
    let resultsList = await Promise.all(
      ebrPackList.map((pack) => getSpecificEBRPack(pack))
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
          packType: GameType.EarthborneRangers,
          pack: r.res.data as any,
          pack_code: r.packCode,
        };
      });
  }
  async getEncounterSetData(): Promise<ILoadEncounterSetData[]> {
    return [];
  }
  checkIsPlayerPack(_packCode: string): boolean {
    return true;
  }
  convertCardDataToCommonFormat(packWithMetadata: {
    pack: any;
    metadata: IPackMetadata;
  }): CardData[] {
    const pack = packWithMetadata.pack as EBRPack;
    return pack.map((c) => ({
      code: c.code,
      name: c.name,
      images: {
        front: c.frontImage,
        back: c.backImage,
      },
      octgnId: null,
      quantity: c.qtd ?? 1,
      doubleSided: false,
      backLink: null,
      typeCode: c.set,
      subTypeCode: null,
      extraInfo: {
        campaign: false,
        setCode: c.set,
        packCode: "TODO - ebr",
        setType: c.setType,
        factionCode: null,
        sizeType: CardSizeType.Standard,
      },
    }));
  }

  parseDecklist(
    _response: AxiosResponse<any, any>,
    _state: RootState
  ): [string[], ILoadedDeck] {
    throw new Error("Method not implemented.");
  }

  loadDeckFromText(text: string): string[][] {
    throw new Error("Method not implemented.");
  }

  isCardBackImg(imgUrl: string): boolean {
    return imgUrl.indexOf("card_back") !== -1;
  }

  getEncounterEntitiesFromState(
    setData: ISetData,
    herosData: ICardData,
    _encounterEntities: ICardData
  ): IEncounterEntity[] {
    const cardsBySetCodes: { [key: string]: CardData[] } = {};
    Object.values(herosData).forEach((card) => {
      const setCode = card.extraInfo.setCode || "unknown";
      if (!!cardsBySetCodes[setCode]) {
        cardsBySetCodes[setCode].push(card);
      } else {
        cardsBySetCodes[setCode] = [card];
      }
    });

    let returnEntities: IEncounterEntity[] = [];
    Object.entries(cardsBySetCodes).forEach(([setId, setCards]) => {
      returnEntities = returnEntities.concat([
        {
          setCode: setId,
          setData: setData[setId],
          cards: setCards,
        },
      ]);
    });
    return returnEntities;
  }

  splitEncounterCardsIntoStacksWhenLoading(
    _setCode: string,
    encounterCards: CardData[]
  ): CardData[][] {
    let returnVal: CardData[] = [];
    encounterCards.forEach(
      (e) =>
        (returnVal = returnVal.concat(
          Array.from({ length: e.quantity }).map((_i) => e)
        ))
    );

    return [returnVal];
  }

  getCustomTokenInfoForCard?(
    _card: ICardStack,
    cardType: string,
    defaultTokenInfo: TokensInfo
  ): TokensInfo | null {
    if (cardType === "aspect") {
      return {
        ...defaultTokenInfo,
        damage: {
          ...defaultTokenInfo.damage,
          imagePath:
            "/images/from_modules/earthborne-rangers/awareness_token.png",
          overridePosition: { x: 40, y: 50 },
        } as NumericTokenInfo,
        threat: {
          ...defaultTokenInfo.threat,
          imagePath: "/images/from_modules/earthborne-rangers/spirit_token.png",
          overridePosition: { x: 115, y: 50 },
        } as NumericTokenInfo,
        generic: {
          ...defaultTokenInfo.generic,
          imagePath:
            "/images/from_modules/earthborne-rangers/fitness_token.png",
          overridePosition: { x: 40, y: 160 },
        } as NumericTokenInfo,
        acceleration: {
          ...defaultTokenInfo.acceleration,
          imagePath: "/images/from_modules/earthborne-rangers/focus_token.png",
          overridePosition: { x: 115, y: 160 },
        } as NumericTokenInfo,
      };
    }
    return defaultTokenInfo;
  }
}

const getSpecificEBRPack = async (
  packName: string
): Promise<{ res: AxiosResponse<EBRPack>; packCode: string }> => {
  const response = await axios.get<EBRPack>(
    "/json_data/from_modules/earthborne-rangers/sets/" + packName
  );
  return {
    res: response,
    packCode: packName.split(".json")[0],
  };
};
