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
import { packList as lorcanaPackList } from "./generated/packsList";
import { properties } from "./properties";

interface LorcanaCard {
  id: number;
  name: string;
  title: string;
  cost: number;
  inkwell: number;
  attack: number;
  defence: number;
  color: number;
  type: string;
  action: string;
  flavour: string;
  separator: string;
  stars: number;
  illustrator: string;
  card_set_id: number;
  language: string;
  number: number;
  pack: string;
  rarity: string;
  image: string;
  blurhash: string;
  franchise_id: number;
  final: number;
  spoiler: number;
  created_at: string;
  updated_at: string;
  traits: string[];
  FrontImage: string;
  FrontImageAlt: string;
  BackImage: string;
}

interface Scenario {
  Name: string;
  Cards: ScenarioCard[];
}

interface StandardCardGamePack {
  cards: ScenarioCard[];
}

interface ScenarioCard {
  Deck: string;
  Code: string;
  Title: string;
  FrontImage: string;
  BackImage: string;
  Type: string;
  ScenarioDeck: string;
  CardSize: CardSizeType;
  Quantity?: number;
}

export default class LorcanaGameModule extends GameModule {
  constructor() {
    super(properties, {}, {}, {}, []);
  }

  getSetData(): ISetData {
    const setData: ISetData = {};
    return setData;
  }
  async getCardsData(): Promise<ILoadCardsData[]> {
    let resultsList = await Promise.all(
      lorcanaPackList.map((pack) => getSpecificLorcanaPack(pack))
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
          packType: GameType.Lorcana,
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
    const pack = packWithMetadata.pack as LorcanaCard[];
    return pack.map((c) => ({
      code: `${c.name.toLocaleLowerCase()}${
        c.title ? "_" + c.title.toLocaleLowerCase() : ""
      }`,
      name: `${c.name}${c.title ? " " + c.title : ""}`,
      images: {
        front: c.FrontImage,
        back: c.BackImage,
      },
      octgnId: null,
      quantity: 1,
      doubleSided: false,
      backLink: null,
      typeCode: c.type,
      subTypeCode: null,
      extraInfo: {
        campaign: false,
        setCode: `${c.card_set_id}`,
        packCode: "TODO - lorcana",
        setType: null,
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

  loadDeckFromText(_text: string): string[] {
    return ["tinker bell_giant fairy"];
  }

  getEncounterEntitiesFromState(
    _setData: ISetData,
    _herosData: ICardData,
    encounterEntities: ICardData
  ): IEncounterEntity[] {
    return [];
  }

  splitEncounterCardsIntoStacksWhenLoading(
    _setCode: string,
    _encounterCards: CardData[]
  ): CardData[][] {
    return [];
  }
}

const getSpecificLorcanaPack = async (
  packName: string
): Promise<{ res: AxiosResponse<LorcanaCard[]>; packCode: string }> => {
  const response = await axios.get<LorcanaCard[]>("/json_data/" + packName);
  return {
    res: response,
    packCode: packName.split(".json")[0],
  };
};
