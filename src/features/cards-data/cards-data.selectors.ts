import { createSelector } from "@reduxjs/toolkit";
import { RootState } from "../../store/rootReducer";

export const getCardsData = (state: RootState) => state.cardsData;

export const getCardsDataEntities = createSelector(
  getCardsData,
  (cardsData) => {
    return { ...cardsData.entities, ...cardsData.encounterEntities };
  }
);

export const getCardsDataHeroEntities = createSelector(
  getCardsData,
  (cardsData) => {
    return cardsData.entities;
  }
);

export const getCardsDataEncounterEntities = createSelector(
  getCardsData,
  (cardsData) => {
    return cardsData.encounterEntities;
  }
);
