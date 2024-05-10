// import { createSelector } from "@reduxjs/toolkit";
import { createSelector } from "reselect";
import { RootState } from "../../store/rootReducer";
import { TokenMap } from "./initialState";

export const getTokenBagsState = (state: RootState) =>
  state.liveState.present.tokenBags;

export const getTokenBags = createSelector(
  getTokenBagsState,
  (tokenBagsState) => tokenBagsState.bags
);

export const getTokensByTypeForBagIndex = (index: number) =>
  createSelector(getTokenBags, (bags) => {
    if (bags.length - 1 < index) return {};

    const bag = bags[index];
    return bag.tokens.reduce((map, t) => {
      map[t.code] = t;
      return map;
    }, {} as TokenMap);
  });
