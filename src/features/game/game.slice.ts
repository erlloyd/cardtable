import { createSlice, CaseReducer, PayloadAction } from "@reduxjs/toolkit";
import { Vector2d } from "konva/types/types";
import { resetApp } from "../../store/global.actions";
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
  extraReducers: (builder) => {
    builder.addCase(resetApp, (state, action) => {
      state.stagePosition = { x: 0, y: 0 };
      state.stageZoom = { x: 1, y: 1 };
    });
  },
});

export const { updateZoom, updatePosition } = gameSlice.actions;

export default gameSlice.reducer;
