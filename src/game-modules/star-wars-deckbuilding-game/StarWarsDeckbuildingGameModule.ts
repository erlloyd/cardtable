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
  ILoadedDeckMetadata,
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
import { IPlayerBoard } from "../../features/cards/initialState";
import { makeBasicPlayerBoard } from "../../utilities/playerboard-utils";
import { COLORS } from "../../constants/app-constants";

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
  ): [string[], ILoadedDeck, ILoadedDeckMetadata] {
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
    faceup: boolean,
    typeCode?: string
  ): number {
    // if we're facedown, then we don't rotate
    if (!faceup) return 0;

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

    // Base game
    const rebel_starter = [...(temp["Rebel Starter"] || [])];
    const empire_starter = [...(temp["Empire Starter"] || [])];
    const rebel_bases = [...(temp["Rebel Bases"] || [])];
    const empire_bases = [...(temp["Empire Bases"] || [])];
    const always_available = [...(temp["Always Available"] || [])];

    // Clone wars
    const republic_starter = [...(temp["Republic Starter"] || [])];
    const separatist_starter = [...(temp["Separatist Starter"] || [])];
    const republic_bases = [...(temp["Republic Bases"] || [])];
    const separatist_bases = [...(temp["Separatist Bases"] || [])];
    const always_available_clone_wars = [
      ...temp["Always Available Clone Wars"],
    ];

    const misc = [...temp["Miscellaneous"]];
    const force_tracker = [...temp["Force Tracker"]];

    let galaxy_row = [];

    let returnVal = [] as CardData[][];
    switch (setCode) {
      case "Standard":
        galaxy_row = [
          ...temp["Galaxy Row Rebel"],
          ...temp["Galaxy Row Empire"],
          ...temp["Galaxy Row Neutral"],
          ...temp["Capital Ships Rebel"],
          ...temp["Capital Ships Empire"],
          ...temp["Capital Ships Neutral"],
        ];

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
      case "Standard (Clone Wars)":
        galaxy_row = [
          ...temp["Galaxy Row Republic"],
          ...temp["Galaxy Row Separatist"],
          ...temp["Galaxy Row Neutral Clone Wars"],
          ...temp["Capital Ships Republic"],
          ...temp["Capital Ships Separatist"],
          ...temp["Capital Ships Neutral Clone Wars"],
        ];

        returnVal = [
          republic_starter,
          separatist_starter,
          republic_bases,
          separatist_bases,
          always_available_clone_wars,
          galaxy_row,
          misc,
          force_tracker,
        ];
        break;
      case "2v2":
        galaxy_row = [
          ...temp["Galaxy Row Rebel"],
          ...temp["Galaxy Row Empire"],
          ...temp["Galaxy Row Neutral"],
          ...temp["Capital Ships Rebel"],
          ...temp["Capital Ships Empire"],
          ...temp["Capital Ships Neutral"],
        ];
        const misc2v2 = [...temp["Miscellaneous"]];
        const force_tracker2v2 = [...temp["Force Tracker"]];
        returnVal = [
          rebel_starter,
          rebel_starter,
          empire_starter,
          empire_starter,
          rebel_bases,
          rebel_bases,
          empire_bases,
          empire_bases,
          always_available,
          always_available,
          galaxy_row,
          galaxy_row,
          misc,
          misc,
          force_tracker,
        ];
        break;
      case "Solo: Leaders (Rebels)":
      case "Solo: Leaders (Empire)":
        galaxy_row = [
          ...temp["Galaxy Row Rebel"],
          ...temp["Galaxy Row Empire"],
          ...temp["Galaxy Row Neutral"],
          ...temp["Capital Ships Rebel"],
          ...temp["Capital Ships Empire"],
          ...temp["Capital Ships Neutral"],
        ];
        // Manually remove the leader for now
        // TODO: make this better
        let leader: CardData[] = [];
        if (setCode.includes("Rebel")) {
          leader = galaxy_row.filter((c) => c.code === "g31");
          galaxy_row = galaxy_row.filter((c) => c.code !== "g31");
        } else if (setCode.includes("Empire")) {
          leader = galaxy_row.filter((c) => c.code === "g16");
          galaxy_row = galaxy_row.filter((c) => c.code !== "g16");
        }

        returnVal = [
          rebel_starter,
          empire_starter,
          rebel_bases,
          empire_bases,
          always_available,
          galaxy_row,
          leader,
          force_tracker,
        ];
        break;
    }
    return returnVal;
  }

  getTokensForEncounterSet(setCode: string): IFlippableToken[] {
    switch (setCode) {
      case "Standard":
      case "Standard (Clone Wars)":
        return [
          {
            id: uuidv4(),
            faceup: true,
            imgUrl:
              "/images/from_modules/star-wars-deckbuilding-game/force_tracker.png",
            backImgUrl:
              "/images/from_modules/star-wars-deckbuilding-game/force_tracker.png",
            position: { x: 0, y: 0 },
            controlledBy: null,
            code: "force_tracker",
          },
        ];
      case "2v2":
        return [
          {
            id: uuidv4(),
            faceup: true,
            imgUrl:
              "/images/from_modules/star-wars-deckbuilding-game/force_tracker.png",
            backImgUrl:
              "/images/from_modules/star-wars-deckbuilding-game/force_tracker.png",
            position: { x: 0, y: 0 },
            controlledBy: null,
            code: "force_tracker",
          },
          {
            id: uuidv4(),
            faceup: true,
            imgUrl:
              "/images/from_modules/star-wars-deckbuilding-game/force_tracker.png",
            backImgUrl:
              "/images/from_modules/star-wars-deckbuilding-game/force_tracker.png",
            position: { x: 0, y: 0 },
            controlledBy: null,
            code: "force_tracker",
          },
        ];
      case "Solo: Leaders (Rebels)":
      case "Solo: Leaders (Empire)":
        return [
          {
            id: uuidv4(),
            faceup: true,
            imgUrl:
              "/images/from_modules/star-wars-deckbuilding-game/force_tracker.png",
            backImgUrl:
              "/images/from_modules/star-wars-deckbuilding-game/force_tracker.png",
            position: { x: 0, y: 0 },
            controlledBy: null,
            code: "force_tracker",
          },
          {
            id: uuidv4(),
            faceup: true,
            imgUrl:
              "/images/from_modules/star-wars-deckbuilding-game/force_tracker.png",
            backImgUrl:
              "/images/from_modules/star-wars-deckbuilding-game/force_tracker.png",
            position: { x: 0, y: 0 },
            controlledBy: null,
            code: "force_tracker",
          },
          {
            id: uuidv4(),
            faceup: true,
            imgUrl:
              "/images/from_modules/star-wars-deckbuilding-game/force_tracker.png",
            backImgUrl:
              "/images/from_modules/star-wars-deckbuilding-game/force_tracker.png",
            position: { x: 0, y: 0 },
            controlledBy: null,
            code: "force_tracker",
          },
        ];
    }
    return [];
  }

  getCountersForEncounterSet(setCode: string): ICounter[] {
    switch (setCode) {
      case "Standard":
      case "Standard (Clone Wars)":
        return [
          {
            id: "",
            position: { x: 0, y: 0 },
            text: "Resources",
            color: COLORS.YELLOW,
            value: 0,
          },
          {
            id: "",
            position: { x: 0, y: 0 },
            text: "Resources",
            color: COLORS.YELLOW,
            value: 0,
          },
        ];
      case "2v2":
        return [
          {
            id: "",
            position: { x: 0, y: 0 },
            text: "Resources",
            color: COLORS.YELLOW,
            value: 0,
          },
          {
            id: "",
            position: { x: 0, y: 0 },
            text: "Resources",
            color: COLORS.YELLOW,
            value: 0,
          },
          {
            id: "",
            position: { x: 0, y: 0 },
            text: "Resources",
            color: COLORS.YELLOW,
            value: 0,
          },
          {
            id: "",
            position: { x: 0, y: 0 },
            text: "Resources",
            color: COLORS.YELLOW,
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
            color: COLORS.YELLOW,
            value: 0,
          },
          {
            id: "",
            position: { x: 0, y: 0 },
            text: "AI Resources",
            color: COLORS.YELLOW,
            value: 0,
          },
        ];
    }
    return [];
  }

  getPlayerBoardsForEncounterSet(setCode: string): IPlayerBoard[] {
    const id = uuidv4();
    switch (setCode) {
      case "Solo: Leaders (Rebels)":
        return [
          makeBasicPlayerBoard({
            id,
            cardSlots: [
              { relativeX: 345, relativeY: 191, landscape: false },
              { relativeX: 139, relativeY: 221, landscape: true },
              { relativeX: 139, relativeY: 165, landscape: true },
              { relativeX: 139, relativeY: 125, landscape: true },
            ],
            code: id,
            image:
              "https://ik.imagekit.io/cardtable/star_wars_deckbuilding_game/solo_leaders/leaders_empire_ai_card.png",
            height: 350,
            width: 455,
          }),
        ];
      case "Solo: Leaders (Empire)":
        return [
          makeBasicPlayerBoard({
            id,
            cardSlots: [
              { relativeX: 345, relativeY: 191, landscape: false },
              { relativeX: 139, relativeY: 221, landscape: true },
              { relativeX: 139, relativeY: 165, landscape: true },
              { relativeX: 139, relativeY: 125, landscape: true },
            ],
            code: id,
            image:
              "https://ik.imagekit.io/cardtable/star_wars_deckbuilding_game/solo_leaders/leaders_rebel_ai_card.png",
            height: 350,
            width: 455,
          }),
        ];
    }
    return [];
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
