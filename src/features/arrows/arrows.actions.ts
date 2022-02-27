import { createAction } from "@reduxjs/toolkit";
import { Vector2d } from "konva/lib/types";

export interface StartNewArrowPayload {
  startCardId: string;
}

export interface UpdateArrowPositionPayload {
  startCardId: string;
  pos: Vector2d;
}

export const startNewArrowNOPE =
  createAction<StartNewArrowPayload>("startNewArrow");

export const updateArrowPositionNOPE = createAction<UpdateArrowPositionPayload>(
  "updateArrowPosition"
);
