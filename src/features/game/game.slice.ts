import { createSlice, CaseReducer, PayloadAction } from "@reduxjs/toolkit";
import { Vector2d } from "konva/types/types";
import { initialState, IGameState } from "./initialState";

// Reducers
const updateZoomReducer: CaseReducer<IGameState, PayloadAction<Vector2d>> = (
  state,
  action
) => {
  state.stageZoom = action.payload;
  return state;
};

const updatePositionReducer: CaseReducer<
  IGameState,
  PayloadAction<Vector2d>
> = (state, action) => {
  state.stagePosition = action.payload;
  return state;
};

// slice
const gameSlice = createSlice({
  name: "game",
  initialState: initialState,
  reducers: {
    updateZoom: updateZoomReducer,
    updatePosition: updatePositionReducer,
  },
});

export const { updateZoom, updatePosition } = gameSlice.actions;

export default gameSlice.reducer;
