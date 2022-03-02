import { CaseReducer, createSlice, PayloadAction } from "@reduxjs/toolkit";
import { Vector2d } from "konva/lib/types";
import { receiveRemoteGameState, resetApp } from "../../store/global.actions";
import { IArrowsState, initialState } from "./initialState";

// Reducers
const startNewArrowForCardsReducer: CaseReducer<
  IArrowsState,
  PayloadAction<{ startCardIds: string[]; myRef: string }>
> = (state, action) => {
  let myArrows = state.arrows[action.payload.myRef];
  if (!myArrows) {
    myArrows = [];
    state.arrows[action.payload.myRef] = myArrows;
  }
  state.arrows[action.payload.myRef] = myArrows.concat(
    action.payload.startCardIds.map((sc) => ({ startCardId: sc, color: "red" }))
  );
};

const endDisconnectedArrowReducer: CaseReducer<
  IArrowsState,
  PayloadAction<{ endCardId: string; myRef: string }>
> = (state, action) => {
  let myArrows = state.arrows[action.payload.myRef];
  if (!!myArrows) {
    myArrows
      .filter((a) => !a.endCardId)
      .forEach((drawingArrow) => {
        drawingArrow.endCardId = action.payload.endCardId;
        drawingArrow.endArrowPosition = null;
      });
  }
};

const updateDisconnectedArrowPositionReducer: CaseReducer<
  IArrowsState,
  PayloadAction<{ endPos: Vector2d; myRef: string }>
> = (state, action) => {
  let myArrows = state.arrows[action.payload.myRef];
  if (!!myArrows) {
    myArrows
      .filter((a) => !a.endCardId)
      .forEach((drawingArrow) => {
        drawingArrow.endArrowPosition = action.payload.endPos;
      });
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

const removeAllArrowsReducer: CaseReducer<IArrowsState> = (state) => {
  state.arrows = {};
};

// slice
const arrowsSlice = createSlice({
  name: "arrows",
  initialState: initialState,
  reducers: {
    startNewArrowForCards: startNewArrowForCardsReducer,
    updateDisconnectedArrowPosition: updateDisconnectedArrowPositionReducer,
    removeAnyDisconnectedArrows: removeAnyDisconnectedArrowsReducer,
    endDisconnectedArrow: endDisconnectedArrowReducer,
    removeAllArrows: removeAllArrowsReducer,
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
  startNewArrowForCards,
  updateDisconnectedArrowPosition,
  removeAnyDisconnectedArrows,
  endDisconnectedArrow,
  removeAllArrows,
} = arrowsSlice.actions;

export default arrowsSlice.reducer;
