import { createSlice, CaseReducer } from "@reduxjs/toolkit";
import { initialState, ICardsDataState } from "./initialState";

import * as PackData from "../../external/generated/packs";
// import { CardData as CardDataLOTR } from "../../external-api/beorn-json-data";
import {
  CardData as CardDataMarvel,
  CardPack as CardPackMarvel,
} from "../../external-api/marvel-card-data";
import SetData from "../../external/marvelsdb-json-data/sets.json";
import { CardData } from "../../external-api/common-card-data";

// Utilities
const convertMarvelToCommonFormat = (
  cardMarvelFormat: CardDataMarvel
): CardData => {
  const mappedCardData: CardData = {
    code: cardMarvelFormat.code,
    name: cardMarvelFormat.name,
    images: null,
    octgnId: cardMarvelFormat.octgn_id ?? null,
    quantity: cardMarvelFormat.quantity,
    doubleSided: !!cardMarvelFormat.double_sided,
    backLink: cardMarvelFormat.back_link ?? null,
    typeCode: cardMarvelFormat.type_code,
    subTypeCode: null,
    extraInfo: {
      setCode: cardMarvelFormat.set_code ?? null,
      packCode: cardMarvelFormat.pack_code,
      factionCode: cardMarvelFormat.faction_code,
    },
  };
  return mappedCardData;
};

// Reducers
const loadCardsDataReducer: CaseReducer<ICardsDataState> = (state) => {
  //This reducer is only intended to be called a single time each load.
  state.entities = {};
  state.encounterEntities = {};
  const heroPacks = Object.entries(PackData)
    .filter(([key, value]) => !key.includes("_encounter"))
    .map(([key, value]) => (value as unknown) as CardPackMarvel);

  const encounterPacks = Object.entries(PackData)
    .filter(([key, value]) => key.includes("_encounter"))
    .map(([key, value]) => (value as unknown) as CardPackMarvel);

  heroPacks.forEach((pack) =>
    pack.map(convertMarvelToCommonFormat).forEach((card: CardData) => {
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
    pack.map(convertMarvelToCommonFormat).forEach((card: CardData) => {
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
