import { createSelector } from "@reduxjs/toolkit";
import { RootState } from "../../store/rootReducer";
import { ICardStack } from "./initialState";

export const getCards = (state: RootState) => state.liveState.present.cards;
export const getPlayerHands = (state: RootState) =>
  state.liveState.present.cards.playerHands;

export const getCardMapById = createSelector(getCards, (cards) => {
  return cards.cards.reduce((map: { [k: string]: ICardStack }, card) => {
    map[card.id] = card;
    return map;
  }, {});
});

export const cardsSelectedWithPeerRef = (peerRef: string) =>
  createSelector(getCards, (cards) => {
    return cards.cards.filter((c) => c.selected && c.controlledBy === peerRef);
  });

export const anyCardsSelectedWithPeerRef = (peerRef: string) =>
  createSelector(getCards, (cards) => {
    return cards.cards.some((c) => c.selected && c.controlledBy === peerRef);
  });

export const getPanMode = (state: RootState) =>
  state.liveState.present.cards.panMode;

export const getMultiselectMode = (state: RootState) =>
  state.liveState.present.cards.multiselectMode;

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

export const getPlayerCardsForPlayerNumber = (num: number) =>
  createSelector(getPlayerHands, (playerHands) => {
    const index = num - 1;
    return index >= 0 && index < playerHands.length ? playerHands[index] : null;
  });
