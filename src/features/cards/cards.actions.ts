import { createAction } from "@reduxjs/toolkit";
import { Vector2d } from "konva/lib/types";
import { ICardDetails } from "./initialState";

export interface AddCardStackWithIdPayload {
  cardJsonIds: string[];
  position: Vector2d;
  id: string;
}

export interface PullCardOutOfCardStackWithIdPayload {
  cardStackId: string;
  jsonId: string;
  pos: Vector2d;
  id: string;
}

export interface StartCardMoveWithSplitStackIdPayload {
  id: string;
  splitTopCard: boolean;
  splitCardId: string;
}

export interface DrawCardsOutOfCardStackWithIdsPayload {
  cardStackId: string;
  numberToDraw: number;
  idsToUse: string[];
}

export interface ReplaceCardStackPayload {
  id: string;
  newStack: ICardDetails[];
}

export interface CreateDeckPayload {
  position: Vector2d;
  heroId: string;
  data: any;
  dataId: string;
  extraHeroCards: ICardDetails[];
  relatedEncounterDeck: string[];
  encounterDeckId: string;
  relatedObligationDeck: string[];
  obligationDeckId: string;
}

export const addCardStackWithId =
  createAction<AddCardStackWithIdPayload>("addCardStackWithId");

export const pullCardOutOfCardStackWithId =
  createAction<PullCardOutOfCardStackWithIdPayload>(
    "pullCardOutOfCardStackWithId"
  );

export const drawCardsOutOfCardStackWithIds =
  createAction<DrawCardsOutOfCardStackWithIdsPayload>(
    "drawCardsOutOfCardStackWithIds"
  );

export const startCardMoveWithSplitStackId =
  createAction<StartCardMoveWithSplitStackIdPayload>(
    "startCardMoveWithSplitStackId"
  );

export const replaceCardStack =
  createAction<ReplaceCardStackPayload>("replaceCardStack");

export const setStackShuffling =
  createAction<{
    id: string;
    shuffling: boolean;
  }>("setStackShuffling");

export const createDeckFromTextFileWithIds = createAction<CreateDeckPayload>(
  "createDeckFromTextFileWithIds"
);
