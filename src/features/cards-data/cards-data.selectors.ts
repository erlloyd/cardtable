import { createSelector } from "@reduxjs/toolkit";
import { RootState } from "../../store/rootReducer";

export const getCardsData = (state: RootState) => state.cardsData;

export const getCardsDataEntities = createSelector(
  getCardsData,
  (cardsData) => {
    return cardsData.entities;
  }
);
