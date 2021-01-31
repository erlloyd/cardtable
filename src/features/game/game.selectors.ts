import { createSelector } from "@reduxjs/toolkit";
import { RootState } from "../../store/rootReducer";

export const getGame = (state: RootState) => state.game;

export const getCurrentZoom = createSelector(getGame, (game) => {
  return game.stageZoom;
});

export const getPlayerColors = createSelector(getGame, (game) => {
  return game.playerColors;
});

export const getPeerId = createSelector(getGame, (game) => game.peerId);
