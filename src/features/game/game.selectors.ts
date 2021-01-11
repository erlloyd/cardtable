import { createSelector } from "@reduxjs/toolkit";
import { RootState } from "../../store/rootReducer";

export const getGame = (state: RootState) => state.game.present;

export const getCurrentZoom = createSelector(getGame, (game) => {
  return game.stageZoom;
});
