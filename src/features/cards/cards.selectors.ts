import { createSelector } from "@reduxjs/toolkit";
import { RootState } from "../../store/rootReducer";
import { ICardStack, IDropTarget } from "./initialState";
import { v4 } from "uuid";

export const getCards = (state: RootState) => state.liveState.present.cards;
export const getPlayerHands = (state: RootState) =>
  state.liveState.present.cards.playerHands;
export const getPlayerBoards = (state: RootState) =>
  state.liveState.present.cards.playerBoards;

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
    [key: string]: { ownerRef: string; card: IDropTarget | null };
  } = {};
  Object.entries(cards.dropTargetCards).forEach(([key, value]) => {
    if (!!value) {
      // There's only a card id if this isn't a player board slot, so
      // use some dummy ids for player board slots
      const randomid = `PLAYER_BOARD_SLOT-${v4()}`;
      const idToUse = value.cardStack?.id || randomid;
      returnVal[idToUse] = { ownerRef: key, card: value };
    }
  });

  // console.log("returning droptargetsbyid", returnVal);

  return returnVal;
});

export const anyCardsDragging = createSelector(getCards, (cards) => {
  return !cards.cards.some((c) => c.dragging);
});

export const getPlayerCardsForPlayerNumber = (num: number) =>
  createSelector(getPlayerHands, (playerHands) => {
    const index = num - 1;
    return index >= 0 && index < playerHands.length ? playerHands[index] : null;
  });
