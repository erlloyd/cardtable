import { createAction } from "@reduxjs/toolkit";
import { Vector2d } from "konva/lib/types";

export interface AddNewCounterWithIdPayload {
  imgUrl?: string;
  pos: Vector2d;
  id: string;
}

export const addNewCounterWithId = createAction<AddNewCounterWithIdPayload>(
  "addNewCounterWithId"
);
