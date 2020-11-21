import { createSlice, CaseReducer } from "@reduxjs/toolkit";
import { initialState, ICardsDataState } from "./initialState";

import CoreData from "../../external/marvelsdb-json-data/pack/core.json";

// Reducers
const loadCardsDataReducer: CaseReducer<ICardsDataState> = (state) => {
  //This reducer is only intended to be called a single time each load.
  CoreData.forEach((card) => {
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
