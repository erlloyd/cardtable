import { createAction } from "@reduxjs/toolkit";
import { RootState } from "./rootReducer";
import { GameType } from "../game-modules/GameType";

export const resetApp = createAction<GameType>("resetAction");

export const receiveRemoteGameState = createAction<RootState>(
  "receiveRemoteGameState"
);

export const verifyRemoteGameState = createAction<RootState>(
  "verifyRemoteGameState"
);

export const startDraggingCardFromHand = createAction(
  "startDraggingCardFromHand"
);
