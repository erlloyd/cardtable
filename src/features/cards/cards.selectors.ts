import { createSelector } from "@reduxjs/toolkit";
import { RootState } from "../../store/rootReducer";
import { ICardStack } from "./initialState";

export const getCards = (state: RootState) => state.cards;

export const getCardMapById = createSelector(getCards, (cards) => {
  return cards.cards.reduce((map: { [k: string]: ICardStack }, card) => {
    map[card.id] = card;
    return map;
  }, {});
});

export const shouldShowPreview = createSelector(getCards, (cards) => {
  return !!cards.previewCard && cards.cards.every((card) => !card.dragging);
});

export const getPanMode = (state: RootState) => state.cards.panMode;
