import { CaseReducer, createSlice, PayloadAction } from "@reduxjs/toolkit";
import { Vector2d } from "konva/lib/types";
import {
  CardtableAction,
  MAX_RECENTLY_LOADED_DECKS,
  myPeerRef,
  PlayerColor,
} from "../../constants/app-constants";
import {
  receiveRemoteGameState,
  resetApp,
  startDraggingCardFromHand,
} from "../../store/global.actions";
import { getListOfDecklistsFromSearchTerm } from "../cards/cards.thunks";
import { MAX_PLAYERS } from "../cards/initialState";
import {
  IChangelogEntry,
  ICustomGame,
  IGameState,
  initialState,
  IRecentlyLoadedDeck,
  ISettings,
  TokenBagMenuInfo,
} from "./initialState";
import { GameType } from "../../game-modules/GameType";
import { ITokenBag } from "../token-bags/initialState";

// Reducers
const startUndoRedoReducer: CaseReducer<IGameState> = (state, action) => {
  state.undoing = true;

  if (action.REMOTE_ACTION) {
    state.remoteUndoing = true;
  }
};

const endUndoRedoReducer: CaseReducer<IGameState> = (state, action) => {
  state.undoing = false;
  if (action.REMOTE_ACTION) {
    state.remoteUndoing = false;
  }
};

const updateAndShowChangelogReducer: CaseReducer<
  IGameState,
  PayloadAction<IChangelogEntry[]>
> = (state, action) => {
  state.mostRecentChangelog = action.payload;
  state.showChangelog = true;
};

const toggleShowCurrentChangelogReducer: CaseReducer<IGameState> = (state) => {
  if (!!state.mostRecentChangelog) {
    state.showChangelog = !state.showChangelog;
  }
};

const toggleShowFullHandUIReducer: CaseReducer<IGameState> = (state) => {
  state.showFullHandUI = !state.showFullHandUI;
};

const addCustomGameReducer: CaseReducer<
  IGameState,
  PayloadAction<ICustomGame>
> = (state, action) => {
  // Replace the current custom game if necessary
  if (state.customGames.some((cg) => cg.gameType === action.payload.gameType)) {
    const existingIndex = state.customGames.findIndex(
      (cg) => cg.gameType === action.payload.gameType
    );
    state.customGames[existingIndex] = action.payload;
  } else {
    state.customGames.push(action.payload);
  }
  return state;
};

const removeCustomGameReducer: CaseReducer<
  IGameState,
  PayloadAction<string>
> = (state, action) => {
  state.customGames = state.customGames.filter(
    (g) => g.gameType !== action.payload
  );
  return state;
};

const updateZoomReducer: CaseReducer<IGameState, PayloadAction<Vector2d>> = (
  state,
  action
) => {
  state.stageZoom = action.payload;
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

const togglePreviewCardRotationReducer: CaseReducer<IGameState> = (state) => {
  if (!!state.previewCard || !!state.menuPreviewCardJsonId) {
    state.rotatePreviewCard180 = !state.rotatePreviewCard180;
  }
};

const clearPreviewCardReducer: CaseReducer<IGameState> = (state) => {
  state.previewCard = null;
  state.menuPreviewCardJsonId = null;
  state.menuPreviewCardModal = false;
  state.rotatePreviewCard180 = false;
};

const setMenuPreviewCardJsonIdReducer: CaseReducer<
  IGameState,
  PayloadAction<{ id: string; modal?: boolean }>
> = (state, action) => {
  state.menuPreviewCardJsonId = action.payload.id;
  state.menuPreviewCardModal = !!action.payload.modal;
};

const clearMenuPreviewCardJsonIdReducer: CaseReducer<IGameState> = (state) => {
  state.previewCard = null;
  state.menuPreviewCardJsonId = null;
  state.menuPreviewCardModal = false;
  state.rotatePreviewCard180 = false;
};

const requestResyncReducer: CaseReducer<
  IGameState,
  PayloadAction<{ includeCustomCards: boolean }>
> = () => {};

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

const showCardPeekForCardsReducer: CaseReducer<
  IGameState,
  PayloadAction<number>
> = (state, action) => {
  state.showCardPeekCards = action.payload;
};

const hideCardPeekReducer: CaseReducer<IGameState> = (state) => {
  state.showCardPeekCards = null;
};

const showDeckTextImporterReducer: CaseReducer<
  IGameState,
  PayloadAction<Vector2d>
> = (state, action) => {
  state.showDeckTextImporterWithPosition = action.payload;
};

const hideDeckTextImporterReducer: CaseReducer<IGameState> = (state) => {
  state.showDeckTextImporterWithPosition = null;
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

const storeRecentlyLoadedDeckReducer: CaseReducer<
  IGameState,
  CardtableAction<IRecentlyLoadedDeck>
> = (state, action) => {
  if (!action.CURRENT_GAME_TYPE) return;
  if (state.recentlyLoadedDecks[action.CURRENT_GAME_TYPE]) {
    const decks = state.recentlyLoadedDecks[action.CURRENT_GAME_TYPE];
    const numToRemove = decks.length - MAX_RECENTLY_LOADED_DECKS - 1;
    const newDecks = decks.slice(0, -1 * numToRemove);
    state.recentlyLoadedDecks[action.CURRENT_GAME_TYPE] = newDecks;
  }

  // Now add the deck to the end of the list
  let decks = state.recentlyLoadedDecks[action.CURRENT_GAME_TYPE];
  if (!decks) {
    decks = [];
  }
  const decksWithNew = [...[action.payload], ...decks];
  state.recentlyLoadedDecks[action.CURRENT_GAME_TYPE] = decksWithNew;
};

const clearRecentlyLoadedDecksReducer: CaseReducer<
  IGameState,
  CardtableAction<undefined>
> = (state, action) => {
  if (!action.CURRENT_GAME_TYPE) return;
  if (state.recentlyLoadedDecks[action.CURRENT_GAME_TYPE]) {
    state.recentlyLoadedDecks[action.CURRENT_GAME_TYPE] = [];
  }
};

const setTokenBagMenuPositionReducer: CaseReducer<
  IGameState,
  CardtableAction<TokenBagMenuInfo>
> = (state, action) => {
  state.tokenBagMenu = action.payload;
};

const clearTokenBagMenuReducer: CaseReducer<IGameState> = (state) => {
  state.tokenBagMenu = null;
};

const showTokenBagEditorReducer: CaseReducer<
  IGameState,
  CardtableAction<{ bag: ITokenBag; viewOnly: boolean }>
> = (state, action) => {
  state.showTokenBagAdjuster = {
    id: action.payload.bag.id,
    viewOnly: action.payload.viewOnly,
  };
};

const hideTokenBagEditorReducer: CaseReducer<IGameState> = (state) => {
  state.showTokenBagAdjuster = null;
};

const showSettingsUiReducer: CaseReducer<IGameState> = (state) => {
  state.settings.visible = true;
};

const hideSettingsUiReducer: CaseReducer<IGameState> = (state) => {
  state.settings.visible = false;
};

const updateSettingsReducer: CaseReducer<
  IGameState,
  CardtableAction<ISettings>
> = (state, action) => {
  state.settings = { ...state.settings, ...action.payload };
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
    togglePreviewCardRotation: togglePreviewCardRotationReducer,
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
    showCardPeekForCards: showCardPeekForCardsReducer,
    hideCardPeek: hideCardPeekReducer,
    showDeckTextImporter: showDeckTextImporterReducer,
    hideDeckTextImporter: hideDeckTextImporterReducer,
    stopDraggingCardFromHand: stopDraggingCardFromHandReducer,
    toggleDrawCardsIntoHand: toggleDrawCardsIntoHandReducer,
    toggleSnapCardsToGrid: toggleSnapCardsToGridReducer,
    setVisiblePlayerHandNumber: setVisiblePlayerHandNumberReducer,
    setDrawingArrow: setDrawingArrowReducer,
    doneLoadingJSON: doneLoadingJSONReducer,
    addCustomGame: addCustomGameReducer,
    removeCustomGame: removeCustomGameReducer,
    toggleShowFullHandUI: toggleShowFullHandUIReducer,
    updateAndShowChangelog: updateAndShowChangelogReducer,
    toggleShowCurrentChangelog: toggleShowCurrentChangelogReducer,
    startUndoRedo: startUndoRedoReducer,
    endUndoRedo: endUndoRedoReducer,
    storeRecentlyLoadedDeck: storeRecentlyLoadedDeckReducer,
    clearRecentlyLoadedDecks: clearRecentlyLoadedDecksReducer,
    setTokenBagMenuPosition: setTokenBagMenuPositionReducer,
    clearTokenBagMenu: clearTokenBagMenuReducer,
    showTokenBagEditor: showTokenBagEditorReducer,
    hideTokenBagEditor: hideTokenBagEditorReducer,
    showSettingsUi: showSettingsUiReducer,
    hideSettingsUi: hideSettingsUiReducer,
    updateSettings: updateSettingsReducer,
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
  togglePreviewCardRotation,
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
  showCardPeekForCards,
  hideCardPeek,
  showDeckTextImporter,
  hideDeckTextImporter,
  stopDraggingCardFromHand,
  toggleDrawCardsIntoHand,
  toggleSnapCardsToGrid,
  setVisiblePlayerHandNumber,
  setDrawingArrow,
  doneLoadingJSON,
  addCustomGame,
  removeCustomGame,
  toggleShowFullHandUI,
  updateAndShowChangelog,
  toggleShowCurrentChangelog,
  startUndoRedo,
  endUndoRedo,
  storeRecentlyLoadedDeck,
  clearRecentlyLoadedDecks,
  setTokenBagMenuPosition,
  clearTokenBagMenu,
  showTokenBagEditor,
  hideTokenBagEditor,
  showSettingsUi,
  hideSettingsUi,
  updateSettings,
} = gameSlice.actions;

export default gameSlice.reducer;
