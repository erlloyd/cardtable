import { createAction } from "@reduxjs/toolkit";
import { RootState } from "./rootReducer";

export const resetApp = createAction("resetAction");

export const receiveRemoteGameState = createAction<RootState>(
  "receiveRemoteGameState"
);
