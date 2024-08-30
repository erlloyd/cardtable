import { createAction } from "@reduxjs/toolkit";
import { Vector2d } from "konva/lib/types";
import { IToken } from "./initialState";

export interface AddNewTokenBagWithIdPayload {
  id: string;
  code: string;
  quantity: number;
  position: Vector2d;
  imgUrl: string;
  initialTokens: IToken[];
}

export const addNewTokenBagWithId = createAction<AddNewTokenBagWithIdPayload>(
  "addNewTokenBagWithId"
);
