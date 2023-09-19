import { createSlice } from "@reduxjs/toolkit";
import { receiveRemoteGameState, resetApp } from "../../store/global.actions";
import { initialState } from "./initialState";
import { addNewPlaymatInColumnWithId } from "./playmats.actions";

// Reducers

// slice
const playmatsSlice = createSlice({
  name: "playmats",
  initialState: initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder.addCase(receiveRemoteGameState, (state, action) => {
      state.playmats = action.payload.liveState.present.playmats.playmats;
    });

    builder.addCase(resetApp, (state, _action) => {
      state.playmats = [];
    });

    builder.addCase(addNewPlaymatInColumnWithId, (state, action) => {
      //Find the biggest number for row that exists right now
      const biggestRow =
        state.playmats.length === 0
          ? 0
          : Math.max(...state.playmats.map((p) => p.gridRow));

      const nextRow = biggestRow + 1;
      state.playmats.push({
        id: action.payload.id,
        gridColumn: 0,
        gridRow: nextRow,
        imgUrl: action.payload.imgUrl,
      });
    });
  },
});

export const {} = playmatsSlice.actions;

export default playmatsSlice.reducer;
