import { createAction } from "@reduxjs/toolkit";
import { Vector2d } from "konva/lib/types";

export interface AddNew {
  startCardId: string;
}

export interface AddNewPlaymatInColumnWithIdPayload {
  id: string;
  imgUrl: string;
}

export const addNewPlaymatInColumnWithId =
  createAction<AddNewPlaymatInColumnWithIdPayload>(
    "addNewPlaymatInColumnWithId"
  );
