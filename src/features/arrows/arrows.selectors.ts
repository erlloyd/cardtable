// import { createSelector } from "@reduxjs/toolkit";
import { createSelector } from "reselect";
import { RootState } from "../../store/rootReducer";

export const getArrows = (state: RootState) => state.liveState.present.arrows;

export const getFlatArrows = createSelector(getArrows, (arrowsState) => {
  return Object.values(arrowsState.arrows).flat();
});
