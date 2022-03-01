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

// slice
const arrowsSlice = createSlice({
  name: "arrows",
  initialState: initialState,
  reducers: {
    startNewArrow: startNewArrowReducer,
    updateDisconnectedArrowPosition: updateDisconnectedArrowPositionReducer,
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

export const { startNewArrow, updateDisconnectedArrowPosition } =
  arrowsSlice.actions;

export default arrowsSlice.reducer;
