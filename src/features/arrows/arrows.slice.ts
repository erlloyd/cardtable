import { CaseReducer, createSlice, PayloadAction } from "@reduxjs/toolkit";
import { Vector2d } from "konva/lib/types";
import { receiveRemoteGameState, resetApp } from "../../store/global.actions";
import { IArrowsState, initialState } from "./initialState";

// Reducers
const startNewArrowReducer: CaseReducer<
  IArrowsState,
  PayloadAction<{ startCardId: string; myRef: string }>
> = (state, action) => {
  let myArrows = state.arrows[action.payload.myRef];
  if (!myArrows) {
    myArrows = [];
    state.arrows[action.payload.myRef] = myArrows;
  }
  myArrows.push({ startCardId: action.payload.startCardId, color: "red" });
};

const endDisconnectedArrowReducer: CaseReducer<
  IArrowsState,
  PayloadAction<{ endCardId: string; myRef: string }>
> = (state, action) => {
  let myArrows = state.arrows[action.payload.myRef];
  if (!!myArrows) {
    // get the first arrow without an end card.
    // that is currently how we're finding the "drawing"
    // arrow
    const drawingArrow = myArrows.find((a) => !a.endCardId);
    if (drawingArrow) {
      drawingArrow.endCardId = action.payload.endCardId;
      drawingArrow.endArrowPosition = null;
    }
  }
};

const updateDisconnectedArrowPositionReducer: CaseReducer<
  IArrowsState,
  PayloadAction<{ endPos: Vector2d; myRef: string }>
> = (state, action) => {
  let myArrows = state.arrows[action.payload.myRef];
  if (!!myArrows) {
    // get the first arrow without an end card.
    // that is currently how we're finding the "drawing"
    // arrow
    const drawingArrow = myArrows.find((a) => !a.endCardId);
    if (drawingArrow) {
      drawingArrow.endArrowPosition = action.payload.endPos;
    }
  }
};

const removeAnyDisconnectedArrowsReducer: CaseReducer<
  IArrowsState,
  PayloadAction<string>
> = (state, action) => {
  const myArrows = state.arrows[action.payload];
  if (!!myArrows) {
    state.arrows[action.payload] = myArrows.filter((a) => !!a.endCardId);
  }
};

// slice
const arrowsSlice = createSlice({
  name: "arrows",
  initialState: initialState,
  reducers: {
    startNewArrow: startNewArrowReducer,
    updateDisconnectedArrowPosition: updateDisconnectedArrowPositionReducer,
    removeAnyDisconnectedArrows: removeAnyDisconnectedArrowsReducer,
    endDisconnectedArrow: endDisconnectedArrowReducer,
  },
  extraReducers: (builder) => {
    builder.addCase(receiveRemoteGameState, (state, action) => {
      state.arrows = action.payload.liveState.present.arrows.arrows;
    });

    builder.addCase(resetApp, (state, action) => {
      state.arrows = {};
    });
  },
});

export const {
  startNewArrow,
  updateDisconnectedArrowPosition,
  removeAnyDisconnectedArrows,
  endDisconnectedArrow,
} = arrowsSlice.actions;

export default arrowsSlice.reducer;
