import { createAction } from "@reduxjs/toolkit";
import { RootState } from "./rootReducer";

export const resetApp = createAction("resetAction");

export const receiveRemoteGameState = createAction<RootState>(
  "receiveRemoteGameState"
);

export const verifyRemoteGameState = createAction<RootState>(
  "verifyRemoteGameState"
);

export const startDraggingCardFromHand = createAction(
  "startDraggingCardFromHand"
);
