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
import { v4 as uuidv4 } from "uuid";
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
    setCode: string,
    encounterCards: CardData[]
  ): CardData[][] {
    const temp = groupBy<CardData>(encounterCards, (e) => e.extraInfo.setCode);

    let returnVal = [] as CardData[][];
    switch (setCode) {
      case "The Fellowship of the Ring":
        const balrog = [
          ...temp["Monstrous"],
          ...temp["Mordor"],
          ...temp["Isengard"],
        ];
        const gandalf = [
          ...temp["Dúnedain"],
          ...temp["Dwarf"],
          ...temp["Elf"],
          ...temp["Hobbit"],
          ...temp["Wizard"],
        ];
        const bg = [
          ...temp["Free People Strongholds"],
          ...temp["Shadow Strongholds"],
        ];
        const p = [
          ...temp["Path6"],
          ...temp["Path5"],
          ...temp["Path4"],
          ...temp["Path3"],
          ...temp["Path2"],
          ...temp["Path1"],
        ];
        const m = [...temp["Miscellaneous"]];
        returnVal = [balrog, gandalf, bg, p, m];
        break;
      case "Trilogy":
        const frodo = [
          ...temp["Dwarf"],
          ...temp["Hobbit"],
          ...temp["Rohan"],
          ...temp["Wizard"],
        ];
        const witchKing = [...temp["Mordor"]];
        const aragorn = [...temp["Dúnedain"], ...temp["Elf"]];
        const saruman = [
          ...temp["Isengard"],
          ...temp["Monstrous"],
          ...temp["Southron"],
        ];
        const fpStrongholds = [...temp["Free People Strongholds"]];
        const shadowStrongholds = [...temp["Shadow Strongholds"]];
        const paths = [
          ...temp["Path9"],
          ...temp["Path8"],
          ...temp["Path7"],
          ...temp["Path6"],
          ...temp["Path5"],
          ...temp["Path4"],
          ...temp["Path3"],
          ...temp["Path2"],
          ...temp["Path1"],
        ];
        const misc = [...temp["Miscellaneous"]];

        returnVal = [
          frodo,
          witchKing,
          aragorn,
          saruman,
          fpStrongholds,
          shadowStrongholds,
          paths,
          misc,
        ];
        break;
      case "Two-Player Duel":
        const gandalf2p = [
          ...temp["Dwarf"],
          ...temp["Hobbit"],
          ...temp["Rohan"],
          ...temp["Wizard"],
          ...temp["Dúnedain"],
          ...temp["Elf"],
        ];
        const witchKing2p = [
          ...temp["Mordor"],
          ...temp["Isengard"],
          ...temp["Monstrous"],
          ...temp["Southron"],
        ];

        const fpStrongholds2p = [...temp["Free People Strongholds"]];
        const shadowStrongholds2p = [...temp["Shadow Strongholds"]];
        const paths2p = [
          ...temp["Path9"],
          ...temp["Path8"],
          ...temp["Path7"],
          ...temp["Path6"],
          ...temp["Path5"],
          ...temp["Path4"],
          ...temp["Path3"],
          ...temp["Path2"],
          ...temp["Path1"],
        ];
        const misc2p = [...temp["Miscellaneous"]];

        returnVal = [
          gandalf2p,
          witchKing2p,
          fpStrongholds2p,
          shadowStrongholds2p,
          paths2p,
          misc2p,
        ];
        break;
      case "Three-Player Duel":
        const gandalf3p = [
          ...temp["Dwarf"],
          ...temp["Hobbit"],
          ...temp["Rohan"],
          ...temp["Wizard"],
          ...temp["Dúnedain"],
          ...temp["Elf"],
        ];
        const witchKing3p = [...temp["Mordor"]];
        const saruman3p = [
          ...temp["Isengard"],
          ...temp["Monstrous"],
          ...temp["Southron"],
        ];

        const fpStrongholds3p = [...temp["Free People Strongholds"]];
        const shadowStrongholds3p = [...temp["Shadow Strongholds"]];
        const paths3p = [
          ...temp["Path9"],
          ...temp["Path8"],
          ...temp["Path7"],
          ...temp["Path6"],
          ...temp["Path5"],
          ...temp["Path4"],
          ...temp["Path3"],
          ...temp["Path2"],
          ...temp["Path1"],
        ];
        const misc3p = [...temp["Miscellaneous"]];

        returnVal = [
          gandalf3p,
          witchKing3p,
          saruman3p,
          fpStrongholds3p,
          shadowStrongholds3p,
          paths3p,
          misc3p,
        ];
        break;
    }

    return returnVal;
  }

  getTokensForEncounterSet(setCode: string): IFlippableToken[] {
    switch (setCode) {
      case "The Fellowship of the Ring":
        return [
          {
            id: uuidv4(),
            faceup: true,
            imgUrl:
              "/images/from_modules/war-of-the-ring-card-game/fp_ring_front.png",
            backImgUrl:
              "/images/from_modules/war-of-the-ring-card-game/fp_ring_back.png",
            position: { x: 0, y: 0 },
          },
          {
            id: uuidv4(),
            faceup: true,
            imgUrl:
              "/images/from_modules/war-of-the-ring-card-game/shadow_ring_front.png",
            backImgUrl:
              "/images/from_modules/war-of-the-ring-card-game/shadow_ring_back.png",
            position: { x: 0, y: 0 },
          },
        ];
      case "Trilogy":
        return [
          {
            id: uuidv4(),
            faceup: true,
            imgUrl:
              "/images/from_modules/war-of-the-ring-card-game/fp_ring_front.png",
            backImgUrl:
              "/images/from_modules/war-of-the-ring-card-game/fp_ring_back.png",
            position: { x: 0, y: 0 },
          },
          {
            id: uuidv4(),
            faceup: true,
            imgUrl:
              "/images/from_modules/war-of-the-ring-card-game/fp_ring_front.png",
            backImgUrl:
              "/images/from_modules/war-of-the-ring-card-game/fp_ring_back.png",
            position: { x: 0, y: 0 },
          },
          {
            id: uuidv4(),
            faceup: true,
            imgUrl:
              "/images/from_modules/war-of-the-ring-card-game/shadow_ring_front.png",
            backImgUrl:
              "/images/from_modules/war-of-the-ring-card-game/shadow_ring_back.png",
            position: { x: 0, y: 0 },
          },
          {
            id: uuidv4(),
            faceup: true,
            imgUrl:
              "/images/from_modules/war-of-the-ring-card-game/shadow_ring_front.png",
            backImgUrl:
              "/images/from_modules/war-of-the-ring-card-game/shadow_ring_back.png",
            position: { x: 0, y: 0 },
          },
          {
            id: uuidv4(),
            faceup: true,
            imgUrl:
              "/images/from_modules/war-of-the-ring-card-game/turn_order_marker.png",
            position: { x: 0, y: 0 },
          },
        ];

      case "Two-Player Duel":
        return [
          {
            id: uuidv4(),
            faceup: true,
            imgUrl:
              "/images/from_modules/war-of-the-ring-card-game/fp_ring_front.png",
            backImgUrl:
              "/images/from_modules/war-of-the-ring-card-game/fp_ring_back.png",
            position: { x: 0, y: 0 },
          },
          {
            id: uuidv4(),
            faceup: true,
            imgUrl:
              "/images/from_modules/war-of-the-ring-card-game/shadow_ring_front.png",
            backImgUrl:
              "/images/from_modules/war-of-the-ring-card-game/shadow_ring_back.png",
            position: { x: 0, y: 0 },
          },
        ];
      case "Three-Player Duel":
        return [
          {
            id: uuidv4(),
            faceup: true,
            imgUrl:
              "/images/from_modules/war-of-the-ring-card-game/fp_ring_front.png",
            backImgUrl:
              "/images/from_modules/war-of-the-ring-card-game/fp_ring_back.png",
            position: { x: 0, y: 0 },
          },
          {
            id: uuidv4(),
            faceup: true,
            imgUrl:
              "/images/from_modules/war-of-the-ring-card-game/shadow_ring_front.png",
            backImgUrl:
              "/images/from_modules/war-of-the-ring-card-game/shadow_ring_back.png",
            position: { x: 0, y: 0 },
          },
          {
            id: uuidv4(),
            faceup: true,
            imgUrl:
              "/images/from_modules/war-of-the-ring-card-game/shadow_ring_front.png",
            backImgUrl:
              "/images/from_modules/war-of-the-ring-card-game/shadow_ring_back.png",
            position: { x: 0, y: 0 },
          },
          {
            id: uuidv4(),
            faceup: true,
            imgUrl:
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
    "/json_data/scenarios/" + scenarioWithExtension
  );
  return response;
};
