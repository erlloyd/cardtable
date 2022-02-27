// import { createSelector } from "@reduxjs/toolkit";
import { RootState } from "../../store/rootReducer";

export const getArrows = (state: RootState) => state.liveState.present.arrows;
