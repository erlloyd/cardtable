import { CaseReducer, createSlice, PayloadAction } from "@reduxjs/toolkit";
import { Vector2d } from "konva/types/types";
import { PlayerColor } from "../../constants/app-constants";
import { resetApp } from "../../store/global.actions";
import { IGameState, initialState } from "./initialState";

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

const connectToRemoteGameReducer: CaseReducer<
  IGameState,
  PayloadAction<string>
> = () => {};

const setPlayerColorReducer: CaseReducer<
  IGameState,
  PayloadAction<{ ref: string; color: PlayerColor }>
> = (state, action) => {
  state.playerColors[action.payload.ref] = action.payload.color;
};

const setPeerIdReducer: CaseReducer<IGameState, PayloadAction<string>> = (
  state,
  action
) => {
  state.peerId = action.payload;
};

const requestResyncReducer: CaseReducer<IGameState> = () => {};

// slice
const gameSlice = createSlice({
  name: "game",
  initialState: initialState,
  reducers: {
    updateZoom: updateZoomReducer,
    updatePosition: updatePositionReducer,
    connectToRemoteGame: connectToRemoteGameReducer,
    setPlayerColor: setPlayerColorReducer,
    setPeerId: setPeerIdReducer,
    requestResync: requestResyncReducer,
  },
  extraReducers: (builder) => {
    builder.addCase(resetApp, (state, action) => {
      state.stagePosition = { x: 0, y: 0 };
      state.stageZoom = { x: 1, y: 1 };
    });
  },
});

export const {
  updateZoom,
  updatePosition,
  connectToRemoteGame,
  setPlayerColor,
  setPeerId,
  requestResync,
} = gameSlice.actions;

export default gameSlice.reducer;
