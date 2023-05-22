import { CaseReducer, createSlice, PayloadAction } from "@reduxjs/toolkit";
import { Vector2d } from "konva/lib/types";
import { PlayerColor } from "../../constants/app-constants";
import { receiveRemoteGameState, resetApp } from "../../store/global.actions";
import { addNewCounterWithId } from "./counters.actions";
import {
  defaultState,
  ICountersState,
  IFlippableToken,
  initialState,
} from "./initialState";

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

const updateCounterColorReducer: CaseReducer<
  ICountersState,
  PayloadAction<{ id: string; newColor: PlayerColor }>
> = (state, action) => {
  const counter = state.counters.find((c) => c.id === action.payload.id);
  if (!!counter) {
    counter.color = action.payload.newColor;
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

const moveFirstPlayerCounterReducer: CaseReducer<
  ICountersState,
  PayloadAction<Vector2d>
> = (state, action) => {
  state.firstPlayerCounterPosition = {
    x: action.payload.x,
    y: action.payload.y,
  };
};

const createNewTokensReducer: CaseReducer<
  ICountersState,
  PayloadAction<IFlippableToken[]>
> = (state, action) => {
  if (state.flippableTokens === undefined || state.flippableTokens === null) {
    state.flippableTokens = [];
  }

  state.flippableTokens = state.flippableTokens.concat(action.payload);
};

const moveTokenReducer: CaseReducer<
  ICountersState,
  PayloadAction<{ id: string; pos: Vector2d }>
> = (state, action) => {
  const t = state.flippableTokens.find((t) => t.id === action.payload.id);

  if (!!t) {
    t.position = action.payload.pos;
  }
};

const flipTokenReducer: CaseReducer<ICountersState, PayloadAction<string>> = (
  state,
  action
) => {
  const t = state.flippableTokens.find((token) => token.id === action.payload);
  if (!!t) {
    t.faceup = !t.faceup;
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
    moveFirstPlayerCounter: moveFirstPlayerCounterReducer,
    createNewTokens: createNewTokensReducer,
    moveToken: moveTokenReducer,
    flipToken: flipTokenReducer,
    updateCounterColor: updateCounterColorReducer,
  },
  extraReducers: (builder) => {
    builder.addCase(receiveRemoteGameState, (state, action) => {
      state.counters = action.payload.liveState.present.counters.counters;
      state.flippableTokens =
        action.payload.liveState.present.counters.flippableTokens;
      state.firstPlayerCounterPosition =
        action.payload.liveState.present.counters.firstPlayerCounterPosition;
    });

    builder.addCase(resetApp, (state, _action) => {
      state.counters = [];
      state.flippableTokens = [];
      state.firstPlayerCounterPosition =
        defaultState.firstPlayerCounterPosition;
    });

    builder.addCase(addNewCounterWithId, (state, action) => {
      state.counters.push({
        id: action.payload.id,
        position: action.payload.pos,
        value: 0,
        color: action.payload.color || "red",
        imgUrl: action.payload.imgUrl,
        text: action.payload.text,
      });
    });
  },
});

export const {
  updateCounterValue,
  removeCounter,
  moveCounter,
  moveFirstPlayerCounter,
  createNewTokens,
  moveToken,
  flipToken,
  updateCounterColor,
} = countersSlice.actions;

export default countersSlice.reducer;
