import { createSelector } from "@reduxjs/toolkit";
import { RootState } from "../../store/rootReducer";

export const getCounters = (state: RootState) =>
  state.liveState.present.counters;

export const getCurrentCounters = createSelector(getCounters, (counters) => {
  return counters.counters;
});

export const getCurrentTokens = createSelector(getCounters, (counters) => {
  return counters.flippableTokens;
});

export const getFirstPlayerTokenPos = createSelector(
  getCounters,
  (counters) => counters.firstPlayerCounterPosition
);

export const tokensSelectedWithPeerRef = (peerRef: string) =>
  createSelector(getCurrentTokens, (tokens) => {
    return tokens.filter((t) => t.controlledBy === peerRef);
  });
