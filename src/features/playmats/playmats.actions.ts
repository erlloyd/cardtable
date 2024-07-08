import { createAction } from "@reduxjs/toolkit";
import { Vector2d } from "konva/lib/types";
import { GameType } from "../../game-modules/GameType";

export interface AddNew {
  startCardId: string;
}

export interface AddNewPlaymatInColumnWithIdPayload {
  id: string;
  imgUrl: string;
  currentNumPlaymats: number;
  currentGameType: GameType;
}

export interface InitBoardSlotsOnPlaymatsPayload {
  currentNumPlaymats: number;
  currentGameType: GameType;
}

export const addNewPlaymatInColumnWithId =
  createAction<AddNewPlaymatInColumnWithIdPayload>(
    "addNewPlaymatInColumnWithId"
  );

export const initBoardSlotsOnPlaymats =
  createAction<InitBoardSlotsOnPlaymatsPayload>("initBoardSlotsOnPlaymats");
