// import { createSelector } from "@reduxjs/toolkit";
import { createSelector } from "reselect";
import { RootState } from "../../store/rootReducer";

export const getPlaymatsState = (state: RootState) =>
  state.liveState.present.playmats;

export const getPlaymats = createSelector(
  getPlaymatsState,
  (playmatsState) => playmatsState.playmats
);

export const getPlaymatsInColumnRowOrder = createSelector(
  getPlaymats,
  (playmatsUnordered) => {
    const playmatsForSort = [...playmatsUnordered];
    return playmatsForSort.sort((p1, p2) => {
      if (p1.gridRow < p2.gridRow) {
        return -1;
      } else if (p1.gridRow > p2.gridRow) {
        return 1;
      } else {
        // They are the same row, so sort by column
        return p2.gridRow - p1.gridRow;
      }
    });
  }
);
