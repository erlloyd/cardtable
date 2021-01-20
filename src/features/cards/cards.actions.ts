import { createAction } from "@reduxjs/toolkit";
import { Vector2d } from "konva/types/types";

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

export const addCardStackWithId = createAction<AddCardStackWithIdPayload>(
  "addCardStackWithId"
);

export const pullCardOutOfCardStackWithId = createAction<PullCardOutOfCardStackWithIdPayload>(
  "pullCardOutOfCardStackWithId"
);

export const startCardMoveWithSplitStackId = createAction<StartCardMoveWithSplitStackIdPayload>(
  "startCardMoveWithSplitStackId"
);