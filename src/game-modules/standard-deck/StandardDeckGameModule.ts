import axios, { AxiosResponse } from "axios";
import { groupBy } from "lodash";
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
import { packList } from "./generated/scenarioList_std_deck";
import { scenarios } from "./jsonMetadata/scenarios/scenarios";
import { properties } from "./properties";

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

export default class StandardDeckGameModule extends GameModule {
  constructor() {
    super(properties, {}, {}, {}, []);
  }
  getSetData(): ISetData {
    const setData: ISetData = {};
    for (const setKey in scenarios) {
      const set = scenarios[setKey];
      setData[set.Name] = {
        setTypeCode: "scenario",
        name: set.Name,
        cardsInSet: set.Cards.map((c) => ({
          code: c.Code,
          quantity: 1,
        })),
      };
    }

    return setData;
  }
  async getCardsData(): Promise<ILoadCardsData[]> {
    return [];
  }
  async getEncounterSetData(): Promise<ILoadEncounterSetData[]> {
    const resultsListStandardDeckScenarios = await Promise.all(
      packList.map((scenarioJsonName) => getSpecificScenario(scenarioJsonName))
    );

    const failedScenario = resultsListStandardDeckScenarios.filter(
      (r) => r.status !== 200
    );
    if (failedScenario.length > 0) {
      log.error(
        "Failed to load some JSON data:",
        failedScenario.map((r) => r.data.Name)
      );
    }
    return resultsListStandardDeckScenarios.map((r) => ({
      gameType: GameType.StandardDeck,
      setCode: "", // We don't need to pass set code in here
      cards: r.data.Cards,
    }));
  }
  checkIsPlayerPack(_packCode: string): boolean {
    return false;
  }
  convertCardDataToCommonFormat(packWithMetadata: {
    pack: any;
    metadata: IPackMetadata;
  }): CardData[] {
    const scenarioPack = packWithMetadata.pack as StandardCardGamePack;
    return scenarioPack.cards.map((c) => ({
      code: c.Code,
      name: c.Title,
      images: {
        front: c.FrontImage,
        back: c.BackImage,
      },
      octgnId: null,
      quantity: 1,
      doubleSided: false,
      backLink: null,
      typeCode: c.Type,
      subTypeCode: null,
      extraInfo: {
        campaign: false,
        setCode: c.ScenarioDeck,
        packCode: "TODO - std",
        setType: null,
        factionCode: null,
        sizeType: c.CardSize,
      },
    }));
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
    return Object.entries(setData).map(([key, value]) => {
      const cardsWithoutQuantity = value.cardsInSet.map(
        (cis) => encounterEntities[cis.code]
      );
      let cards = [] as CardData[];
      cardsWithoutQuantity.forEach((c) => {
        cards = cards.concat(Array.from({ length: c.quantity }).map((_i) => c));
      });
      return {
        setCode: key,
        setData: value,
        cards,
      };
    });
  }

  splitEncounterCardsIntoStacksWhenLoading(
    setCode: string,
    encounterCards: CardData[]
  ): CardData[][] {
    const temp = groupBy<CardData>(encounterCards, (e) => e.extraInfo.setCode);
    return Object.values(temp);
  }
}

const getSpecificScenario = async (
  scenarioWithExtension: string
): Promise<AxiosResponse<Scenario>> => {
  const response = await axios.get<Scenario>(
    "/json_data/scenarios/" + scenarioWithExtension
  );
  return response;
};
