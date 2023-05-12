import axios, { AxiosResponse } from "axios";
import { CardData } from "../../external-api/common-card-data";
import { IEncounterEntity } from "../../features/cards-data/cards-data.selectors";
import { ICardData, ISetData } from "../../features/cards-data/initialState";
import { RootState } from "../../store/rootReducer";
import { packList } from "./generated/scenarioList_wotr";
import {
  GameModule,
  ILoadCardsData,
  ILoadEncounterSetData,
  ILoadedDeck,
  IPackMetadata,
} from "../GameModule";
import { properties } from "./properties";
import log from "loglevel";
import { GameType } from "../GameType";
import { scenarios } from "./jsonMetadata/scenarios/scenarios";
import { groupBy } from "lodash";
import { IFlippableToken } from "../../features/counters/initialState";
import { CardSizeType } from "../../constants/card-constants";
interface Scenario {
  Name: string;
  Cards: ScenarioCard[];
}

interface WOTRCardGamePack {
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
}

export default class WarOfTheRingTheCardGameModule extends GameModule {
  constructor() {
    super(properties, {}, {}, {}, ["stronghold", "path", "misc"]);
  }
  getSetData(): ISetData {
    const setData: ISetData = {};
    for (const setKey in scenarios) {
      const set = scenarios[setKey];
      setData[set.Name] = {
        setTypeCode: "scenario",
        name: set.Name,
        cardsInSet: set.Cards.map((c) => ({ code: c.Code, quantity: 1 })),
      };
    }

    return setData;
  }
  async getCardsData(): Promise<ILoadCardsData[]> {
    return [];
  }
  async getEncounterSetData(): Promise<ILoadEncounterSetData[]> {
    const resultsListWOTRScenarios = await Promise.all(
      packList.map((scenarioJsonName) =>
        getSpecificWOTRScenario(scenarioJsonName)
      )
    );

    const failedScenario = resultsListWOTRScenarios.filter(
      (r) => r.status !== 200
    );
    if (failedScenario.length > 0) {
      log.error(
        "Failed to load some JSON data:",
        failedScenario.map((r) => r.data.Name)
      );
    }
    return resultsListWOTRScenarios.map((r) => ({
      gameType: GameType.WarOfTheRingTheCardGame,
      setCode: "", // We don't need to pass set code in here
      cards: r.data.Cards,
    }));
  }
  checkIsPlayerPack(packCode: string): boolean {
    return false;
  }
  convertCardDataToCommonFormat(packWithMetadata: {
    pack: any;
    metadata: IPackMetadata;
  }): CardData[] {
    const scenarioPack = packWithMetadata.pack as WOTRCardGamePack;
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
        packCode: "TODO - wotr",
        setType: null,
        factionCode: null,
        sizeType: c.CardSize,
      },
    }));
  }
  parseDecklist(
    response: AxiosResponse<any, any>,
    state: RootState
  ): [string[], ILoadedDeck] {
    throw new Error("Method not implemented.");
  }
  getEncounterEntitiesFromState(
    setData: ISetData,
    _herosData: ICardData,
    encounterEntities: ICardData
  ): IEncounterEntity[] {
    return Object.entries(setData).map(([key, value]) => ({
      setCode: key,
      setData: value,
      cards: value.cardsInSet.map((cis) => encounterEntities[cis.code]),
    }));
  }

  splitEncounterCardsIntoStacksWhenLoading(
    encounterCards: CardData[]
  ): CardData[][] {
    const temp = groupBy<CardData>(encounterCards, (e) => e.extraInfo.setCode);
    return Object.values(temp);
  }

  getTokensForEncounterSet(setCode: string): IFlippableToken[] {
    switch (setCode) {
      case "The Fellowship of the Ring":
        return [
          {
            id: "wotr-card-game-fp-ring-token",
            faceup: true,
            imgUrl:
              process.env.PUBLIC_URL +
              "/images/from_modules/war-of-the-ring-card-game/fp_ring_front.png",
            backImgUrl:
              process.env.PUBLIC_URL +
              "/images/from_modules/war-of-the-ring-card-game/fp_ring_back.png",
            position: { x: 0, y: 0 },
          },
          {
            id: "wotr-card-game-shadow-ring-token",
            faceup: true,
            imgUrl:
              process.env.PUBLIC_URL +
              "/images/from_modules/war-of-the-ring-card-game/shadow_ring_front.png",
            backImgUrl:
              process.env.PUBLIC_URL +
              "/images/from_modules/war-of-the-ring-card-game/shadow_ring_back.png",
            position: { x: 0, y: 0 },
          },
          {
            id: "wotr-card-game-player-order-token",
            faceup: true,
            imgUrl:
              process.env.PUBLIC_URL +
              "/images/from_modules/war-of-the-ring-card-game/turn_order_marker.png",
            position: { x: 0, y: 0 },
          },
        ];
    }
    return [];
  }
}

const getSpecificWOTRScenario = async (
  scenarioWithExtension: string
): Promise<AxiosResponse<Scenario>> => {
  const response = await axios.get<Scenario>(
    process.env.PUBLIC_URL + "/json_data/scenarios/" + scenarioWithExtension
  );
  return response;
};
