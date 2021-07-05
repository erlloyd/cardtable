import { createSelector } from "@reduxjs/toolkit";
import { RootState } from "../../store/rootReducer";
import { ICardStack } from "../cards/initialState";

export const getGame = (state: RootState) => state.game;

export const getCurrentZoom = createSelector(getGame, (game) => {
  return game.stageZoom;
});

export const getPlayerColors = createSelector(getGame, (game) => {
  return game.playerColors;
});

export const getPeerId = createSelector(getGame, (game) => game.peerId);

export const getActiveGameType = createSelector(
  getGame,
  (game) => game.activeGameType
);

export const getRadialMenuPosition = createSelector(
  getGame,
  (game) => game.radialMenuPosition
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
      stunned: false,
      confused: false,
      tough: false,
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
  };

  return menuPreviewCard;
});
