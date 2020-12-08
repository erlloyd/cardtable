import { createSlice, CaseReducer } from "@reduxjs/toolkit";
import { initialState, ICardsDataState } from "./initialState";

import * as PackData from "../../external/generated/packs";
import { CardData } from "../../external-api/marvel-card-data";
import SetData from "../../external/marvelsdb-json-data/sets.json";

// Reducers
const loadCardsDataReducer: CaseReducer<ICardsDataState> = (state) => {
  //This reducer is only intended to be called a single time each load.
  state.entities = {};
  state.encounterEntities = {};
  const heroPacks = Object.entries(PackData)
    .filter(([key, value]) => !key.includes("_encounter"))
    .map(([key, value]) => value);

  const encounterPacks = Object.entries(PackData)
    .filter(([key, value]) => key.includes("_encounter"))
    .map(([key, value]) => value);

  heroPacks.forEach((pack) =>
    pack.forEach((card: CardData) => {
      if (state.entities[card.code]) {
        console.error("Found multiple cards with code " + card.code);
      }

      // if (!card.octgn_id) {
      //   console.error(`Card ${card.code} had no octgn_id!`);
      // }

      state.entities[card.code] = card;
    })
  );

  encounterPacks.forEach((pack) =>
    pack.forEach((card: CardData) => {
      if (state.encounterEntities[card.code]) {
        console.error("Found multiple cards with code " + card.code);
      }

      // if (!card.octgn_id) {
      //   console.error(`Card ${card.code}: ${card.name} had no octgn_id!`);
      // }

      state.encounterEntities[card.code] = card;
    })
  );

  SetData.forEach((set) => {
    state.setData[set.code] = {
      name: set.name,
      setTypeCode: set.card_set_type_code,
    };
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
