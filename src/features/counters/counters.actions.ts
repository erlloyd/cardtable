import { createAction } from "@reduxjs/toolkit";
import { Vector2d } from "konva/lib/types";
import { PlayerColor } from "../../constants/app-constants";

export interface AddNewCounterWithIdPayload {
  text?: string;
  imgUrl?: string;
  color?: PlayerColor;
  pos: Vector2d;
  id: string;
}

export const addNewCounterWithId = createAction<AddNewCounterWithIdPayload>(
  "addNewCounterWithId"
);
