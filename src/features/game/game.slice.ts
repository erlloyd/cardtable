import { CaseReducer, createSlice, PayloadAction } from "@reduxjs/toolkit";
import { Vector2d } from "konva/lib/types";
import { myPeerRef, PlayerColor } from "../../constants/app-constants";
import {
  receiveRemoteGameState,
  resetApp,
  startDraggingCardFromHand,
} from "../../store/global.actions";
import { getListOfDecklistsFromSearchTerm } from "../cards/cards.thunks";
import { MAX_PLAYERS } from "../cards/initialState";
import { IGameState, initialState } from "./initialState";
import { GameType } from "../../game-modules/GameType";

// Reducers
const updateZoomReducer: CaseReducer<IGameState, PayloadAction<Vector2d>> = (
  state,
  action
) => {
  state.stageZoom = action.payload;
  return state;
};

const updatePositionReducer: CaseReducer<
  IGameState,
  PayloadAction<Vector2d>
> = (state, action) => {
  state.stagePosition = action.payload;
  return state;
};

const createNewMultiplayerGameReducer: CaseReducer<IGameState> = () => {};

const connectToRemoteGameReducer: CaseReducer<
  IGameState,
  PayloadAction<string>
> = () => {};

const setPlayerInfoReducer: CaseReducer<
  IGameState,
  PayloadAction<{ ref: string; color: PlayerColor; playerNumber: number }>
> = (state, action) => {
  state.playerColors[action.payload.ref] = action.payload.color;
  state.playerNumbers[action.payload.ref] = action.payload.playerNumber;
};

const setAllPlayerInfoReducer: CaseReducer<
  IGameState,
  PayloadAction<{
    colors: { [key: string]: PlayerColor };
    numbers: { [key: string]: number };
  }>
> = (state, action) => {
  state.playerColors = action.payload.colors;
  state.playerNumbers = action.payload.numbers;
};

const removePlayerReducer: CaseReducer<IGameState, PayloadAction<string>> = (
  state,
  action
) => {
  if (!!state.playerColors[action.payload]) {
    delete state.playerColors[action.payload];
  }
  if (!!state.playerNumbers[action.payload]) {
    delete state.playerNumbers[action.payload];
  }
};

const setPeerIdReducer: CaseReducer<IGameState, PayloadAction<string>> = (
  state,
  action
) => {
  state.peerId = action.payload;
};

const setMultiplayerGameNameReducer: CaseReducer<
  IGameState,
  PayloadAction<string>
> = (state, action) => {
  state.multiplayerGameName = action.payload;
};

const setPreviewCardIdReducer: CaseReducer<
  IGameState,
  PayloadAction<string>
> = (state, action) => {
  if (!state.previewCard) {
    state.previewCard = { id: action.payload };
  } else if (state.previewCard.id !== action.payload) {
    state.previewCard.id = action.payload;
  }
};

const clearPreviewCardReducer: CaseReducer<IGameState> = (state) => {
  state.previewCard = null;
};

const setMenuPreviewCardJsonIdReducer: CaseReducer<
  IGameState,
  PayloadAction<string>
> = (state, action) => {
  state.menuPreviewCardJsonId = action.payload;
};

const clearMenuPreviewCardJsonIdReducer: CaseReducer<IGameState> = (state) => {
  state.menuPreviewCardJsonId = null;
};

const requestResyncReducer: CaseReducer<IGameState> = () => {};

const updateActiveGameTypeReducer: CaseReducer<
  IGameState,
  PayloadAction<GameType>
> = (state, action) => {
  state.activeGameType = action.payload;
};

const quitGameReducer: CaseReducer<IGameState> = (state) => {
  state.activeGameType = null;
};

const showRadialMenuAtPositionReducer: CaseReducer<
  IGameState,
  PayloadAction<Vector2d>
> = (state, action) => {
  state.radialMenuPosition = action.payload;
};

const hideRadialMenuReducer: CaseReducer<IGameState> = (state) => {
  state.radialMenuPosition = null;
};

const showSpecificCardLoaderReducer: CaseReducer<
  IGameState,
  PayloadAction<Vector2d>
> = (state, action) => {
  state.specificCardLoaderPosition = action.payload;
};

const hideSpecificCardLoaderReducer: CaseReducer<IGameState> = (state) => {
  state.specificCardLoaderPosition = null;
};

const showDeckSearchReducer: CaseReducer<
  IGameState,
  PayloadAction<Vector2d>
> = (state, action) => {
  state.deckSearchPosition = action.payload;
};

const hideDeckSearchReducer: CaseReducer<IGameState> = (state) => {
  state.deckSearchPosition = null;
};

const stopDraggingCardFromHandReducer: CaseReducer<IGameState> = (state) => {
  state.draggingCardFromHand = false;
};

const toggleDrawCardsIntoHandReducer: CaseReducer<IGameState> = (state) => {
  state.drawCardsIntoHand = !state.drawCardsIntoHand;
};

const toggleSnapCardsToGridReducer: CaseReducer<IGameState> = (state) => {
  state.snapCardsToGrid = !state.snapCardsToGrid;
};

const setVisiblePlayerHandNumberReducer: CaseReducer<
  IGameState,
  PayloadAction<number>
> = (state, action) => {
  if (action.payload >= 1 && action.payload <= MAX_PLAYERS) {
    if (state.playerNumbers[myPeerRef] === action.payload) {
      state.currentVisiblePlayerHandNumber = null;
    } else {
      state.currentVisiblePlayerHandNumber = action.payload;
    }
  }
};

const setDrawingArrowReducer: CaseReducer<
  IGameState,
  PayloadAction<boolean>
> = (state, action) => {
  state.drawingArrow = action.payload;
};

const doneLoadingJSONReducer: CaseReducer<IGameState> = (state) => {
  state.allJsonDataLoaded = true;
};

// slice
const gameSlice = createSlice({
  name: "game",
  initialState: initialState,
  reducers: {
    updateZoom: updateZoomReducer,
    updatePosition: updatePositionReducer,
    connectToRemoteGame: connectToRemoteGameReducer,
    createNewMultiplayerGame: createNewMultiplayerGameReducer,
    setPlayerInfo: setPlayerInfoReducer,
    setAllPlayerInfo: setAllPlayerInfoReducer,
    removePlayer: removePlayerReducer,
    setPeerId: setPeerIdReducer,
    setMultiplayerGameName: setMultiplayerGameNameReducer,
    requestResync: requestResyncReducer,
    setPreviewCardId: setPreviewCardIdReducer,
    clearPreviewCard: clearPreviewCardReducer,
    setMenuPreviewCardJsonId: setMenuPreviewCardJsonIdReducer,
    clearMenuPreviewCardJsonId: clearMenuPreviewCardJsonIdReducer,
    updateActiveGameType: updateActiveGameTypeReducer,
    quitGame: quitGameReducer,
    showRadialMenuAtPosition: showRadialMenuAtPositionReducer,
    hideRadialMenu: hideRadialMenuReducer,
    showSpecificCardLoader: showSpecificCardLoaderReducer,
    hideSpecificCardLoader: hideSpecificCardLoaderReducer,
    showDeckSearch: showDeckSearchReducer,
    hideDeckSearch: hideDeckSearchReducer,
    stopDraggingCardFromHand: stopDraggingCardFromHandReducer,
    toggleDrawCardsIntoHand: toggleDrawCardsIntoHandReducer,
    toggleSnapCardsToGrid: toggleSnapCardsToGridReducer,
    setVisiblePlayerHandNumber: setVisiblePlayerHandNumberReducer,
    setDrawingArrow: setDrawingArrowReducer,
    doneLoadingJSON: doneLoadingJSONReducer,
  },
  extraReducers: (builder) => {
    builder.addCase(receiveRemoteGameState, (state, action) => {
      state.activeGameType = action.payload.game.activeGameType;
    });
    builder.addCase(resetApp, (state, _action) => {
      state.stagePosition = { x: 0, y: 0 };
      state.stageZoom = { x: 0.5, y: 0.5 };
      state.previewCard = null;
    });
    builder.addCase(startDraggingCardFromHand, (state, _action) => {
      state.draggingCardFromHand = true;
    });
    builder.addCase(
      getListOfDecklistsFromSearchTerm.pending,
      (state, _action) => {
        state.searchingForOnlineDecks = true;
        state.mostRecentOnlineDeckSearchResults = {};
      }
    );
    builder.addCase(
      getListOfDecklistsFromSearchTerm.fulfilled,
      (state, action) => {
        state.searchingForOnlineDecks = false;
        state.mostRecentOnlineDeckSearchResults = action.payload ?? {};
      }
    );
    builder.addCase(
      getListOfDecklistsFromSearchTerm.rejected,
      (state, _action) => {
        state.searchingForOnlineDecks = false;
        state.mostRecentOnlineDeckSearchResults = {};
      }
    );
  },
});

export const {
  updateZoom,
  updatePosition,
  connectToRemoteGame,
  createNewMultiplayerGame,
  setPlayerInfo,
  setAllPlayerInfo,
  removePlayer,
  setPeerId,
  setMultiplayerGameName,
  requestResync,
  setPreviewCardId,
  clearPreviewCard,
  setMenuPreviewCardJsonId,
  clearMenuPreviewCardJsonId,
  updateActiveGameType,
  quitGame,
  showRadialMenuAtPosition,
  hideRadialMenu,
  showSpecificCardLoader,
  hideSpecificCardLoader,
  showDeckSearch,
  hideDeckSearch,
  stopDraggingCardFromHand,
  toggleDrawCardsIntoHand,
  toggleSnapCardsToGrid,
  setVisiblePlayerHandNumber,
  setDrawingArrow,
  doneLoadingJSON,
} = gameSlice.actions;

export default gameSlice.reducer;
