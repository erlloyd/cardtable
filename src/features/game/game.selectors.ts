import { createSelector } from "@reduxjs/toolkit";
import { RootState } from "../../store/rootReducer";
import { ICardStack } from "../cards/initialState";
import { useWS } from "../../constants/app-constants";

export const getGame = (state: RootState) => state.game;

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
  useWS ? game.multiplayerGameName : game.peerId
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
    fill: "gray",
    x: 0,
    y: 0,
    statusTokens: {
      stunned: 0,
      confused: 0,
      tough: 0,
    },
    counterTokens: {
      damage: 0,
      threat: 0,
      generic: 0,
    },
    selected: false,
    dragging: false,
    shuffling: false,
    cardStack: [{ jsonId: game.menuPreviewCardJsonId }],
    modifiers: {},
    extraIcons: [],
  };

  return menuPreviewCard;
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
