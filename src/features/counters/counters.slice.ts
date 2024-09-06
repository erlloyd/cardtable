import { CaseReducer, createSlice, PayloadAction } from "@reduxjs/toolkit";
import { Vector2d } from "konva/lib/types";
import {
  PlayerColor,
  COLORS,
  CardtableAction,
} from "../../constants/app-constants";
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

const removeTokensReducer: CaseReducer<
  ICountersState,
  PayloadAction<string[]>
> = (state, action) => {
  state.flippableTokens = state.flippableTokens.filter(
    (t) => !action.payload.includes(t.id)
  );
};

const movingTokensReducer: CaseReducer<
  ICountersState,
  CardtableAction<{ idToPosMap: { [key: string]: Vector2d } }>
> = (state, action) => {
  Object.entries(action.payload.idToPosMap).forEach(([id, pos]) => {
    const token = state.flippableTokens.find((t) => t.id === id);

    if (!token) return;

    token.position = pos;
  });
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

const flipTokenReducer: CaseReducer<ICountersState, CardtableAction<string>> = (
  state,
  action
) => {
  const t = state.flippableTokens.find((token) => token.id === action.payload);
  if (!!t) {
    t.faceup = !t.faceup;
  }
};

const selectTokenReducer: CaseReducer<
  ICountersState,
  CardtableAction<string>
> = (state, action) => {
  // get the token
  const token = state.flippableTokens.find((ft) => ft.id === action.payload);
  if (token && !token.controlledBy) {
    token.controlledBy = action.ACTOR_REF ?? null;
  }
};

const selectMultipleTokensReducer: CaseReducer<
  ICountersState,
  CardtableAction<string[]>
> = (state, action) => {
  // get the token
  const tokens = state.flippableTokens.filter((ft) =>
    action.payload.some((id) => ft.id === id && !ft.controlledBy)
  );
  if (tokens.length > 0) {
    tokens.forEach((token) => (token.controlledBy = action.ACTOR_REF ?? null));
  }
};

const unselectTokenReducer: CaseReducer<
  ICountersState,
  CardtableAction<string>
> = (state, action) => {
  // get the token
  const token = state.flippableTokens.find((ft) => ft.id === action.payload);
  if (token && token.controlledBy === action.ACTOR_REF) {
    token.controlledBy = null;
  }
};

const unselectMultipleTokensReducer: CaseReducer<
  ICountersState,
  CardtableAction<string[]>
> = (state, action) => {
  /// get the token
  const tokens = state.flippableTokens.filter((ft) =>
    action.payload.some(
      (id) => ft.id === id && ft.controlledBy === action.ACTOR_REF
    )
  );
  if (tokens.length > 0) {
    tokens.forEach((token) => (token.controlledBy = null));
  }
};

const unselectAllTokensReducer: CaseReducer<
  ICountersState,
  CardtableAction<any>
> = (state, action) => {
  // get the token
  const tokens = state.flippableTokens.filter(
    (ft) => ft.controlledBy === action.ACTOR_REF
  );
  if (tokens.length > 0) {
    tokens.forEach((token) => (token.controlledBy = null));
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
    removeTokens: removeTokensReducer,
    moveToken: moveTokenReducer,
    flipToken: flipTokenReducer,
    updateCounterColor: updateCounterColorReducer,
    selectToken: selectTokenReducer,
    selectMultipleTokens: selectMultipleTokensReducer,
    unselectToken: unselectTokenReducer,
    unselectMultipleTokens: unselectMultipleTokensReducer,
    unselectAllTokens: unselectAllTokensReducer,
    movingTokens: movingTokensReducer,
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
        color: action.payload.color || COLORS.RED,
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
  removeTokens,
  moveToken,
  flipToken,
  updateCounterColor,
  selectToken,
  selectMultipleTokens,
  unselectToken,
  unselectAllTokens,
  movingTokens,
  unselectMultipleTokens,
} = countersSlice.actions;

export default countersSlice.reducer;
