import { CaseReducer, createSlice, PayloadAction } from "@reduxjs/toolkit";
import { receiveRemoteGameState, resetApp } from "../../store/global.actions";
import { IArrowsState, initialState } from "./initialState";

// Reducers
const startNewArrowReducer: CaseReducer<
  IArrowsState,
  PayloadAction<{ startCardId: string }>
> = (state, action) => {
  state.arrows.push({ startCardId: action.payload.startCardId, color: "red" });
};

// slice
const arrowsSlice = createSlice({
  name: "arrows",
  initialState: initialState,
  reducers: {
    startNewArrow: startNewArrowReducer,
  },
  extraReducers: (builder) => {
    builder.addCase(receiveRemoteGameState, (state, action) => {
      state.arrows = action.payload.liveState.present.arrows.arrows;
    });

    builder.addCase(resetApp, (state, action) => {
      state.arrows = [];
    });
  },
});

export const { startNewArrow } = arrowsSlice.actions;

export default arrowsSlice.reducer;
