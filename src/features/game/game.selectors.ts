import { createSelector } from "@reduxjs/toolkit";
import { RootState } from "../../store/rootReducer";
import { ICardStack } from "../cards/initialState";
import { useWebRTCLocalStorage } from "../../constants/app-constants";
import { CardSizeType } from "../../constants/card-constants";
import { GameType } from "../../game-modules/GameType";

export const getGame = (state: RootState) => state.game;

export const isRemoteUndoing = createSelector(getGame, (game) => {
  return game.remoteUndoing;
});

export const isUndoing = createSelector(getGame, (game) => {
  return game.undoing;
});

export const getMostRecentChangelog = createSelector(getGame, (game) => {
  return game.mostRecentChangelog;
});

export const getShowChangelog = createSelector(getGame, (game) => {
  return game.showChangelog;
});

export const getShowFullHandUI = createSelector(getGame, (game) => {
  return game.showFullHandUI;
});

export const getCustomGames = createSelector(getGame, (game) => {
  return game.customGames;
});

export const getCurrentZoom = createSelector(getGame, (game) => {
  return game.stageZoom;
});

export const getPlayerColors = createSelector(getGame, (game) => {
  return game.playerColors;
});

export const getPlayerNumbers = createSelector(getGame, (game) => {
  return game.playerNumbers;
});

export const getPeerId = createSelector(getGame, (game) =>
  useWebRTCLocalStorage ? game.peerId : game.multiplayerGameName
);

export const getMultiplayerGameName = createSelector(
  getGame,
  (game) => game.multiplayerGameName
);

export const getActiveGameType = createSelector(
  getGame,
  (game) => game.activeGameType
);

export const getRadialMenuPosition = createSelector(
  getGame,
  (game) => game.radialMenuPosition
);

export const getSpecificCardLoaderPosition = createSelector(
  getGame,
  (game) => game.specificCardLoaderPosition
);

export const getDeckSearchPosition = createSelector(
  getGame,
  (game) => game.deckSearchPosition
);

export const getPreviewCard = createSelector(
  getGame,
  (game) => game.previewCard
);

export const getSnapCardsToGrid = createSelector(
  getGame,
  (game) => game.snapCardsToGrid
);

export const getMenuPreviewCard = createSelector(getGame, (game) => {
  if (!game.menuPreviewCardJsonId) return null;

  const menuPreviewCard: ICardStack = {
    id: "menu-preview-card",
    controlledBy: "",
    exhausted: false,
    faceup: true,
    topCardFaceup: false,
    fill: "gray",
    x: 0,
    y: 0,
    statusTokens: {
      stunned: 0,
      confused: 0,
      tough: 0,
    },
    counterTokensList: [],
    selected: false,
    dragging: false,
    shuffling: false,
    cardStack: [{ jsonId: game.menuPreviewCardJsonId }],
    modifiers: {},
    extraIcons: [],
    sizeType: CardSizeType.Standard, // TODO: FIX THIS TO USE THE ACTION CARD SIZE
  };

  return { card: menuPreviewCard, modal: game.menuPreviewCardModal };
});

export const getIsSearchingForOnlineDecks = createSelector(
  getGame,
  (game) => game.searchingForOnlineDecks
);

export const getMostRecentOnlineDeckSearchResults = createSelector(
  getGame,
  (game) => game.mostRecentOnlineDeckSearchResults
);

export const isDoneLoadingJSONData = createSelector(
  getGame,
  (game) => game.allJsonDataLoaded
);

export const getRotatePreviewCard180 = createSelector(
  getGame,
  (game) => game.rotatePreviewCard180
);

export const getRecentlyLoadedDecksForGameType = (gameType: GameType) =>
  createSelector(getGame, (game) => game.recentlyLoadedDecks[gameType] ?? []);

export const getTokenBagMenu = createSelector(
  getGame,
  (game) => game.tokenBagMenu
);
