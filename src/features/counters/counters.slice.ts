import { CaseReducer, createSlice, PayloadAction } from "@reduxjs/toolkit";
import { Vector2d } from "konva/types/types";
import { receiveRemoteGameState, resetApp } from "../../store/global.actions";
import { addNewCounterWithId } from "./counters.actions";
import { ICountersState, initialState } from "./initialState";

// Reducers
const updateCounterValueReducer: CaseReducer<
  ICountersState,
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

const removeCounterReducer: CaseReducer<
  ICountersState,
  PayloadAction<string>
> = (state, action) => {
  state.counters = state.counters.filter((c) => c.id !== action.payload);
};

const moveCounterReducer: CaseReducer<
  ICountersState,
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

// slice
const countersSlice = createSlice({
  name: "counters",
  initialState: initialState,
  reducers: {
    updateCounterValue: updateCounterValueReducer,
    removeCounter: removeCounterReducer,
    moveCounter: moveCounterReducer,
  },
  extraReducers: (builder) => {
    builder.addCase(receiveRemoteGameState, (state, action) => {
      // TODO: find a way to keep this automatic
      state.counters = action.payload.counters.present.counters;
    });

    builder.addCase(resetApp, (state, action) => {
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
  updateCounterValue,
  removeCounter,
  moveCounter,
} = countersSlice.actions;

export default countersSlice.reducer;
