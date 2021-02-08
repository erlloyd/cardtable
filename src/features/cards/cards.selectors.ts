import { createSelector } from "@reduxjs/toolkit";
import { RootState } from "../../store/rootReducer";
import { ICardStack } from "./initialState";

export const getCards = (state: RootState) => state.liveState.present.cards;

export const getCardMapById = createSelector(getCards, (cards) => {
  return cards.cards.reduce((map: { [k: string]: ICardStack }, card) => {
    map[card.id] = card;
    return map;
  }, {});
});

export const getPanMode = (state: RootState) =>
  state.liveState.present.cards.panMode;

export const getDropTargetCardsById = createSelector(getCards, (cards) => {
  const returnVal: {
    [key: string]: { ownerRef: string; card: ICardStack | null };
  } = {};
  Object.entries(cards.dropTargetCards).forEach(([key, value]) => {
    if (!!value) {
      returnVal[value.id] = { ownerRef: key, card: value };
    }
  });

  return returnVal;
});
