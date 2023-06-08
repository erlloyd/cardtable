import axios, { AxiosResponse } from "axios";
import { CardData } from "../../external-api/common-card-data";
import { IEncounterEntity } from "../../features/cards-data/cards-data.selectors";
import { ICardData, ISetData } from "../../features/cards-data/initialState";
import { RootState } from "../../store/rootReducer";
import { packList } from "./generated/scenarioList_swdbg";
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
import {
  ICounter,
  IFlippableToken,
} from "../../features/counters/initialState";
import { CardSizeType } from "../../constants/card-constants";
import { v4 as uuidv4 } from "uuid";

interface Scenario {
  Name: string;
  Cards: ScenarioCard[];
}

interface SWDBGCardGamePack {
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

export default class StarWarsDeckbuildingGameModule extends GameModule {
  constructor() {
    super(properties, {}, {}, {}, ["capital_ship", "base", "leaders_ai"]);
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
          quantity: c.Quantity || 1,
        })),
      };
    }

    return setData;
  }
  async getCardsData(): Promise<ILoadCardsData[]> {
    return [];
  }
  async getEncounterSetData(): Promise<ILoadEncounterSetData[]> {
    const resultsListSWDBGScenarios = await Promise.all(
      packList.map((scenarioJsonName) => getSpecificScenario(scenarioJsonName))
    );

    const failedScenario = resultsListSWDBGScenarios.filter(
      (r) => r.status !== 200
    );
    if (failedScenario.length > 0) {
      log.error(
        "Failed to load some JSON data:",
        failedScenario.map((r) => r.data.Name)
      );
    }
    return resultsListSWDBGScenarios.map((r) => ({
      gameType: GameType.StarWarsDeckbuildingGame,
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
    const scenarioPack = packWithMetadata.pack as SWDBGCardGamePack;
    return scenarioPack.cards.map((c) => ({
      code: c.Code,
      name: c.Title,
      images: {
        front: c.FrontImage,
        back: c.BackImage,
      },
      octgnId: null,
      quantity: c.Quantity || 1,
      doubleSided: false,
      backLink: null,
      typeCode: c.Type,
      subTypeCode: null,
      extraInfo: {
        campaign: false,
        setCode: c.ScenarioDeck,
        packCode: "TODO - swdbg",
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

  additionalRotationForCardForRole(
    role: string,
    _code: string,
    typeCode?: string
  ): number {
    if (role === "Empire" && typeCode === "galaxy_row_rebel") {
      return 180;
    }

    if (role === "Rebel" && typeCode === "galaxy_row_empire") {
      return 180;
    }

    return 0;
  }

  splitEncounterCardsIntoStacksWhenLoading(
    setCode: string,
    encounterCards: CardData[]
  ): CardData[][] {
    const temp = groupBy<CardData>(encounterCards, (e) => e.extraInfo.setCode);
    console.log(temp);
    let returnVal = [] as CardData[][];
    switch (setCode) {
      case "Standard":
        const rebel_starter = [...temp["Rebel Starter"]];
        const empire_starter = [...temp["Empire Starter"]];
        const rebel_bases = [...temp["Rebel Bases"]];
        const empire_bases = [...temp["Empire Bases"]];
        const always_available = [...temp["Always Available"]];
        const galaxy_row = [
          ...temp["Galaxy Row Rebel"],
          ...temp["Galaxy Row Empire"],
          ...temp["Galaxy Row Neutral"],
          ...temp["Capital Ships"],
        ];
        const misc = [...temp["Miscellaneous"]];
        const force_tracker = [...temp["Force Tracker"]];
        returnVal = [
          rebel_starter,
          empire_starter,
          rebel_bases,
          empire_bases,
          always_available,
          galaxy_row,
          misc,
          force_tracker,
        ];
        break;
      case "2v2":
        const rebel_starter2v2 = [...temp["Rebel Starter"]];
        const empire_starter2v2 = [...temp["Empire Starter"]];
        const rebel_bases2v2 = [...temp["Rebel Bases"]];
        const empire_bases2v2 = [...temp["Empire Bases"]];
        const always_available2v2 = [...temp["Always Available"]];
        const galaxy_row2v2 = [
          ...temp["Galaxy Row Rebel"],
          ...temp["Galaxy Row Empire"],
          ...temp["Galaxy Row Neutral"],
          ...temp["Capital Ships"],
        ];
        const misc2v2 = [...temp["Miscellaneous"]];
        const force_tracker2v2 = [...temp["Force Tracker"]];
        returnVal = [
          rebel_starter2v2,
          rebel_starter2v2,
          empire_starter2v2,
          empire_starter2v2,
          rebel_bases2v2,
          rebel_bases2v2,
          empire_bases2v2,
          empire_bases2v2,
          always_available2v2,
          always_available2v2,
          galaxy_row2v2,
          galaxy_row2v2,
          misc2v2,
          misc2v2,
          force_tracker2v2,
        ];
        break;
      case "Solo: Leaders (Rebels)":
      case "Solo: Leaders (Empire)":
        const leader_board = [...temp["Solo Leaders Board"]];
        const rebel_starter2 = [...temp["Rebel Starter"]];
        const empire_starter2 = [...temp["Empire Starter"]];
        const rebel_bases2 = [...temp["Rebel Bases"]];
        const empire_bases2 = [...temp["Empire Bases"]];
        const always_available2 = [...temp["Always Available"]];
        const galaxy_row2 = [
          ...temp["Galaxy Row Rebel"],
          ...temp["Galaxy Row Empire"],
          ...temp["Galaxy Row Neutral"],
          ...temp["Capital Ships"],
        ];
        const leader = [...temp["Leader"]];
        const force_tracker2 = [...temp["Force Tracker"]];
        returnVal = [
          rebel_starter2,
          empire_starter2,
          rebel_bases2,
          empire_bases2,
          always_available2,
          galaxy_row2,
          leader,
          leader_board,
          force_tracker2,
        ];
        break;
    }
    return returnVal;
  }

  getTokensForEncounterSet(setCode: string): IFlippableToken[] {
    switch (setCode) {
      case "Standard":
        return [
          {
            id: uuidv4(),
            faceup: true,
            imgUrl:
              process.env.PUBLIC_URL +
              "/images/from_modules/star-wars-deckbuilding-game/force_tracker.png",
            backImgUrl:
              process.env.PUBLIC_URL +
              "/images/from_modules/star-wars-deckbuilding-game/force_tracker.png",
            position: { x: 0, y: 0 },
          },
        ];
      case "2v2":
        return [
          {
            id: uuidv4(),
            faceup: true,
            imgUrl:
              process.env.PUBLIC_URL +
              "/images/from_modules/star-wars-deckbuilding-game/force_tracker.png",
            backImgUrl:
              process.env.PUBLIC_URL +
              "/images/from_modules/star-wars-deckbuilding-game/force_tracker.png",
            position: { x: 0, y: 0 },
          },
          {
            id: uuidv4(),
            faceup: true,
            imgUrl:
              process.env.PUBLIC_URL +
              "/images/from_modules/star-wars-deckbuilding-game/force_tracker.png",
            backImgUrl:
              process.env.PUBLIC_URL +
              "/images/from_modules/star-wars-deckbuilding-game/force_tracker.png",
            position: { x: 0, y: 0 },
          },
        ];
      case "Solo: Leaders (Rebels)":
      case "Solo: Leaders (Empire)":
        return [
          {
            id: uuidv4(),
            faceup: true,
            imgUrl:
              process.env.PUBLIC_URL +
              "/images/from_modules/star-wars-deckbuilding-game/force_tracker.png",
            backImgUrl:
              process.env.PUBLIC_URL +
              "/images/from_modules/star-wars-deckbuilding-game/force_tracker.png",
            position: { x: 0, y: 0 },
          },
          {
            id: uuidv4(),
            faceup: true,
            imgUrl:
              process.env.PUBLIC_URL +
              "/images/from_modules/star-wars-deckbuilding-game/force_tracker.png",
            backImgUrl:
              process.env.PUBLIC_URL +
              "/images/from_modules/star-wars-deckbuilding-game/force_tracker.png",
            position: { x: 0, y: 0 },
          },
          {
            id: uuidv4(),
            faceup: true,
            imgUrl:
              process.env.PUBLIC_URL +
              "/images/from_modules/star-wars-deckbuilding-game/force_tracker.png",
            backImgUrl:
              process.env.PUBLIC_URL +
              "/images/from_modules/star-wars-deckbuilding-game/force_tracker.png",
            position: { x: 0, y: 0 },
          },
        ];
    }
    return [];
  }

  getCountersForEncounterSet(setCode: string): ICounter[] {
    switch (setCode) {
      case "Standard":
        return [
          {
            id: "",
            position: { x: 0, y: 0 },
            text: "Resources",
            color: "yellow",
            value: 0,
          },
          {
            id: "",
            position: { x: 0, y: 0 },
            text: "Resources",
            color: "yellow",
            value: 0,
          },
        ];
      case "2v2":
        return [
          {
            id: "",
            position: { x: 0, y: 0 },
            text: "Resources",
            color: "yellow",
            value: 0,
          },
          {
            id: "",
            position: { x: 0, y: 0 },
            text: "Resources",
            color: "yellow",
            value: 0,
          },
          {
            id: "",
            position: { x: 0, y: 0 },
            text: "Resources",
            color: "yellow",
            value: 0,
          },
          {
            id: "",
            position: { x: 0, y: 0 },
            text: "Resources",
            color: "yellow",
            value: 0,
          },
        ];
      case "Solo: Leaders (Rebels)":
      case "Solo: Leaders (Empire)":
        return [
          {
            id: "",
            position: { x: 0, y: 0 },
            text: "Resources",
            color: "yellow",
            value: 0,
          },
          {
            id: "",
            position: { x: 0, y: 0 },
            text: "AI Resources",
            color: "yellow",
            value: 0,
          },
        ];
    }
    return [];
  }
}

const getSpecificScenario = async (
  scenarioWithExtension: string
): Promise<AxiosResponse<Scenario>> => {
  const response = await axios.get<Scenario>(
    process.env.PUBLIC_URL + "/json_data/scenarios/" + scenarioWithExtension
  );
  return response;
};
