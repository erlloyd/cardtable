import { createSlice, CaseReducer } from "@reduxjs/toolkit";
import { initialState, ICardsDataState } from "./initialState";

import * as PackData from "../../external/generated/packs";

// Reducers
const loadCardsDataReducer: CaseReducer<ICardsDataState> = (state) => {
  Object.keys(PackData).forEach((pd) => console.log(pd));
  //This reducer is only intended to be called a single time each load.
  PackData.core.forEach((card) => {
    if (state.entities[card.code]) {
      console.error("Found multiple cards with code " + card.code);
    }

    state.entities[card.code] = card;
  });
  return state;
};

// slice
const cardsDataSlice = createSlice({
  name: "cardsData",
  initialState: initialState,
  reducers: {
    loadCardsData: loadCardsDataReducer,
  },
});

export const { loadCardsData } = cardsDataSlice.actions;

export default cardsDataSlice.reducer;
