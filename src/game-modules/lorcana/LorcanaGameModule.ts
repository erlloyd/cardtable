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
  filterAndExpand,
} from "../GameModule";
import { GameType } from "../GameType";
import { packList as lorcanaPackList } from "./generated/packsList";
import { properties } from "./properties";
import { groupBy } from "lodash";
import { ICounter } from "../../features/counters/initialState";

interface LorcanaCard {
  quest?: string;
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
  Quantity?: number;
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
    super(properties, {}, {}, {}, ["location", "quest_battleground"]);
  }

  getSetData(): ISetData {
    const setData: ISetData = {
      deep_trouble: {
        name: "Deep Trouble",
        setTypeCode: "quest",
        cardsInSet: [],
      },
    };
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

    // check if this is a quest
    let isQuest: boolean = false;
    if (pack.some((c) => !!c.quest)) {
      isQuest = true;
    }

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
      quantity: c.Quantity ?? 1,
      doubleSided: false,
      backLink: null,
      typeCode: c.type,
      subTypeCode: null,
      extraInfo: {
        campaign: false,
        setCode: c.quest ?? `${c.card_set_id}`,
        packCode: "TODO - lorcana",
        setType: isQuest ? "quest" : null,
        factionCode: null,
        sizeType:
          c.type === "quest_villain" || c.type === "quest_battleground"
            ? CardSizeType.Tarot
            : CardSizeType.Standard,
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
    try {
      var pixelbornString = atob(text);
      const ids: string[] = [];
      const deck = pixelbornString.split("|");

      // if there is only one thing, the deck probably isn't valid
      if (deck.length <= 1) {
        throw new Error("Unable to load deck");
      }

      deck.forEach((cardInfo) => {
        const cardParts = cardInfo.split("$");
        const name = cardParts[0].toLocaleLowerCase();
        const quantity = Number(cardParts[1]);
        for (let i = 0; i < quantity; i++) {
          ids.push(name);
        }
      });
      return [ids];
    } catch (e) {
      const ids: string[] = [];

      // try parsing line-by-line
      const deck = text
        .split("\n")
        .filter((line) => line.indexOf("//") !== 0)
        .filter((line) => !!line);

      if (deck.length > 1) {
        deck.forEach((cardInfo) => {
          const quantity = parseInt(cardInfo);
          let name = cardInfo.replace(`${quantity}`, "");
          name = name.trim().toLocaleLowerCase().replace(" - ", "_");
          for (let i = 0; i < quantity; i++) {
            ids.push(name);
          }
        });

        return [ids];
      }

      throw new Error("Unable to load deck");
    }
  }

  isCardBackImg(imgUrl: string): boolean {
    return imgUrl.indexOf("card-back") !== -1;
  }

  getEncounterEntitiesFromState(
    setData: ISetData,
    herosData: ICardData,
    encounterEntities: ICardData,
    customCards?: boolean
  ): IEncounterEntity[] {
    //first just get quest cards
    const questCards = Object.values(herosData).filter(
      (c) => c.extraInfo.setType === "quest"
    );
    const dataToReturn = Object.entries(setData).map(([setCode, setData]) => {
      const relatedCards = questCards.filter(
        (qc) => qc.extraInfo.setCode === setCode
      );
      const encounterEntity: IEncounterEntity = {
        cards: relatedCards,
        setCode,
        setData,
      };

      return encounterEntity;
    });
    return dataToReturn;
  }

  splitEncounterCardsIntoStacksWhenLoading(
    _setCode: string,
    encounterCards: CardData[]
  ): CardData[][] {
    const groups = groupBy(encounterCards, (c) => c.typeCode);
    return Object.values(groups).map((g) => filterAndExpand(g, null));
  }

  getCountersForEncounterSet?(setCode: string): ICounter[] {
    const counters: ICounter[] = [
      {
        id: "",
        position: { x: 0, y: 0 },
        text: "Ursula Lore",
        color: "magenta",
        value: 0,
      },
      {
        id: "",
        position: { x: 0, y: 0 },
        text: "Ursula Draw",
        color: "yellow",
        value: 2,
      },
    ];

    return counters;
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
