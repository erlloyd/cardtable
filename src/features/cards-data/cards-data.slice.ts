import {
  createSlice,
  CaseReducer,
  PayloadAction,
  Draft,
} from "@reduxjs/toolkit";
import {
  initialState,
  ICardsDataState,
  IGameCardsDataStateStored,
} from "./initialState";
import { CardData } from "../../external-api/common-card-data";
import { receiveRemoteGameState } from "../../store/global.actions";

// TODO: Get this into modules
import { FORCE_CARD_BACK_MAP } from "../../constants/card-missing-image-map";
import log from "loglevel";
import { ILoadEncounterSetData } from "../../game-modules/GameModule";
import GameManager from "../../game-modules/GameModuleManager";
import { GameType } from "../../game-modules/GameType";
import { updateActiveGameType } from "../game/game.slice";

// Reducers
const loadCardsDataReducer: CaseReducer<
  ICardsDataState,
  PayloadAction<GameType>
> = (state, action) => {
  //This reducer is only intended to be called a single time each load.
  state.data = {};

  let activeData = state.data[action.payload];
  if (!!activeData) {
    activeData.setData = {};
  } else {
    state.data[action.payload] = {
      entities: {},
      encounterEntities: {},
      setData: {},
    };
    activeData = state.data[action.payload];
  }

  const setData = GameManager.getModuleForType(action.payload).getSetData();
  if (!!activeData) {
    activeData.setData = setData;
  }

  return state;
};

const storeCardData =
  (isPlayerPack: boolean) =>
  (cs: {
    location: Draft<IGameCardsDataStateStored> | undefined;
    card: CardData;
  }) => {
    const stateLocation = isPlayerPack
      ? (cs.location as IGameCardsDataStateStored).entities
      : (cs.location as IGameCardsDataStateStored).encounterEntities;

    if (!(cs.card.code[0] === "0" && cs.card.code[1] === "0")) {
      if (
        stateLocation[cs.card.code] &&
        stateLocation[cs.card.code].length > 0
      ) {
        // If we have an explicit back, don't worry about it
        if (!!FORCE_CARD_BACK_MAP[cs.card.code]) {
          return;
        }

        // Next check if the card we are about to add is exactly the
        // same as any other card, if so, skip it
        if (
          stateLocation[cs.card.code].some(
            (c) => JSON.stringify(cs.card) === JSON.stringify(c)
          )
        ) {
          return;
        }

        // Only error if the code and name are different
        if (cs.card.name !== stateLocation[cs.card.code][0].name) {
          log.warn(
            "Found multiple cards with code " +
              cs.card.code +
              " " +
              cs.card.name +
              " " +
              cs.card.extraInfo.setCode +
              " Existing card(s) are " +
              stateLocation[cs.card.code].map((c) => c.name) +
              " " +
              stateLocation[cs.card.code].map((c) => c.extraInfo.setCode)
          );
          log.warn(cs.card);
          log.warn(stateLocation[cs.card.code]);
        }
      } else {
        stateLocation[cs.card.code] = [];
      }

      stateLocation[cs.card.code] = stateLocation[cs.card.code].concat([
        cs.card,
      ]);

      // TODO: Sort here so that custom scenario cards are behind others
      stateLocation[cs.card.code] = stateLocation[cs.card.code].sort((a, b) => {
        if (
          a.extraInfo.setType === "Custom_Scenario_Kit" ||
          a.extraInfo.setType === "Fellowship_Deck"
        ) {
          return 1;
        }

        if (
          b.extraInfo.setType === "Custom_Scenario_Kit" ||
          b.extraInfo.setType === "Fellowship_Deck"
        ) {
          return -1;
        }

        return 0;
      });

      if (stateLocation[cs.card.code].length > 1) {
        log.info(
          `Stored multiple versions of card ${cs.card.code}, now is`,
          stateLocation[cs.card.code]
        );
      }
    }
  };

const bulkLoadCardsForEncounterSetReducer: CaseReducer<
  ICardsDataState,
  PayloadAction<ILoadEncounterSetData[]>
> = (state, action) => {
  action.payload.forEach((r) =>
    loadCardsForEncounterSetReducer(state, {
      type: loadCardsForEncounterSet.type,
      payload: r,
    })
  );
};

const loadCardsForEncounterSetReducer: CaseReducer<
  ICardsDataState,
  PayloadAction<ILoadEncounterSetData>
> = (state, action) => {
  const activeData = state.data[action.payload.gameType];
  const activeSet = activeData?.setData[action.payload.setCode];

  if (!action.payload.cards.map) {
    log.warn("No cards found for scenario " + action.payload.setCode);
    return;
  }

  const fakePack = {
    cards: action.payload.cards,
  };

  const module = GameManager.getModuleForType(action.payload.gameType);
  module
    .convertCardDataToCommonFormat({
      pack: fakePack,
      metadata: {
        setType: "todo - encounter set",
        encounterPack: true,
      },
    })
    .map((c) => {
      return {
        location: state.data[action.payload.gameType],
        card: c,
      };
    })
    .forEach(storeCardData(false));

  if (!!activeSet) {
    activeSet.cardsInSet = activeSet.cardsInSet.concat(
      action.payload.cards
        .filter(
          (cd) => cd.CardSet.toLocaleLowerCase().indexOf("nightmare") === -1
        )
        .map((cd) => {
          return {
            code: cd.Slug,
            quantity: cd.Quantity,
          };
        })
    );
  }

  return state;
};

const bulkLoadCardsDataForPackReducer: CaseReducer<
  ICardsDataState,
  PayloadAction<
    {
      packType: GameType;
      pack: any;
      pack_code: string;
    }[]
  >
> = (state, action) => {
  action.payload.forEach((r) =>
    loadCardsDataForPackReducer(state, {
      type: loadCardsDataForPack.type,
      payload: r,
    })
  );
};

const loadCardsDataForPackReducer: CaseReducer<
  ICardsDataState,
  PayloadAction<{
    packType: GameType;
    pack: any;
    pack_code: string;
  }>
> = (state, action) => {
  if (!state.data[action.payload.packType]) {
    state.data[action.payload.packType] = {
      entities: {},
      encounterEntities: {},
      setData: {},
    };
  }

  const module = GameManager.getModuleForType(action.payload.packType);

  const isHeroPack = module.checkIsPlayerPack(action.payload.pack_code);

  module
    .convertCardDataToCommonFormat({
      pack: action.payload.pack,
      metadata: { setType: action.payload.pack.SetType, encounterPack: false },
    })
    .map((c) => {
      return { location: state.data[action.payload.packType], card: c };
    })
    .forEach(storeCardData(isHeroPack));

  return state;
};

// slice
const cardsDataSlice = createSlice({
  name: "cardsData",
  initialState: initialState,
  reducers: {
    loadCardsData: loadCardsDataReducer,
    loadCardsDataForPack: loadCardsDataForPackReducer,
    bulkLoadCardsDataForPack: bulkLoadCardsDataForPackReducer,
    loadCardsForEncounterSet: loadCardsForEncounterSetReducer,
    bulkLoadCardsForEncounterSet: bulkLoadCardsForEncounterSetReducer,
  },
  extraReducers: (builder) => {
    builder.addCase(receiveRemoteGameState, (state, action) => {
      state.activeDataType =
        action.payload.game.activeGameType ??
        GameManager.allRegisteredGameTypes[0];
    });
    builder.addCase(updateActiveGameType, (state, action) => {
      state.activeDataType = action.payload;
    });
  },
});

export const {
  loadCardsData,
  loadCardsDataForPack,
  bulkLoadCardsDataForPack,
  loadCardsForEncounterSet,
  bulkLoadCardsForEncounterSet,
} = cardsDataSlice.actions;

export default cardsDataSlice.reducer;
