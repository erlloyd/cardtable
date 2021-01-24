import { CaseReducer, createSlice, PayloadAction } from "@reduxjs/toolkit";
import { Vector2d } from "konva/types/types";
import { PlayerColor } from "../../constants/app-constants";
import { receiveRemoteGameState, resetApp } from "../../store/global.actions";
import { addNewCounterWithId } from "./game.actions";
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

const updateCounterValueReducer: CaseReducer<
  IGameState,
  PayloadAction<{ id: string; delta: number }>
> = (state, action) => {
  const counter = state.counters.find((c) => c.id === action.payload.id);
  if (!!counter) {
    counter.value += action.payload.delta;
    if (counter.value < 0) {
      counter.value = 0;
    }
  }
};

const removeCounterReducer: CaseReducer<IGameState, PayloadAction<string>> = (
  state,
  action
) => {
  state.counters = state.counters.filter((c) => c.id !== action.payload);
};

const moveCounterReducer: CaseReducer<
  IGameState,
  PayloadAction<{ id: string; newPos: Vector2d }>
> = (state, action) => {
  const counter = state.counters.find((c) => c.id === action.payload.id);
  if (!!counter) {
    counter.position = {
      x: action.payload.newPos.x,
      y: action.payload.newPos.y,
    };
  }
};

const connectToRemoteGameReducer: CaseReducer<
  IGameState,
  PayloadAction<string>
> = (state, action) => {};

const setPlayerColorReducer: CaseReducer<
  IGameState,
  PayloadAction<{ ref: string; color: PlayerColor }>
> = (state, action) => {
  state.playerColors[action.payload.ref] = action.payload.color;
};

// slice
const gameSlice = createSlice({
  name: "game",
  initialState: initialState,
  reducers: {
    updateZoom: updateZoomReducer,
    updatePosition: updatePositionReducer,
    updateCounterValue: updateCounterValueReducer,
    removeCounter: removeCounterReducer,
    moveCounter: moveCounterReducer,
    connectToRemoteGame: connectToRemoteGameReducer,
    setPlayerColor: setPlayerColorReducer,
  },
  extraReducers: (builder) => {
    builder.addCase(receiveRemoteGameState, (state, action) => {
      // TODO: find a way to keep this automatic
      state.counters = action.payload.game.present.counters;
    });

    builder.addCase(resetApp, (state, action) => {
      state.stagePosition = { x: 0, y: 0 };
      state.stageZoom = { x: 1, y: 1 };
      state.counters = [];
    });

    builder.addCase(addNewCounterWithId, (state, action) => {
      state.counters.push({
        id: action.payload.id,
        position: action.payload.pos,
        value: 0,
      });
    });
  },
});

export const {
  updateZoom,
  updatePosition,
  updateCounterValue,
  removeCounter,
  moveCounter,
  connectToRemoteGame,
  setPlayerColor,
} = gameSlice.actions;

export default gameSlice.reducer;
