import { createSelector } from "@reduxjs/toolkit";
import { RootState } from "../../store/rootReducer";

export const getCounters = (state: RootState) =>
  state.liveState.present.counters;

export const getCurrentCounters = createSelector(getCounters, (counters) => {
  return counters.counters;
});
