import { createAction } from "@reduxjs/toolkit";
import { Vector2d } from "konva/lib/types";
import { ICardDetails, IPlayerBoardSlotLocation } from "./initialState";
import {
  CardSizeType,
  CounterTokenType,
  StatusTokenType,
} from "../../constants/card-constants";

export interface AddCardStackWithSnapAndIdPayload {
  cardJsonIds: string[];
  position: Vector2d;
  snap: boolean;
  id: string;
  sizeType: CardSizeType;
  faceup?: boolean;
}

export interface AddCardStackToPlayerBoardWithIdPayload {
  cardJsonIds: string[];
  slot: IPlayerBoardSlotLocation;
  id: string;
  sizeType: CardSizeType;
  faceup?: boolean;
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
  facedown?: boolean;
  idsToUse: string[];
  drawIntoHand: boolean;
  playerNumber: number;
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

export const addCardStackWithSnapAndId =
  createAction<AddCardStackWithSnapAndIdPayload>("addCardStackWithSnapAndId");

export const addCardStackToPlayerBoardWithId =
  createAction<AddCardStackToPlayerBoardWithIdPayload>(
    "addCardStackToPlayerBoardWithId"
  );

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

export const setStackShuffling = createAction<{
  id: string;
  shuffling: boolean;
}>("setStackShuffling");

export const createDeckFromTextFileWithIds = createAction<CreateDeckPayload>(
  "createDeckFromTextFileWithIds"
);
