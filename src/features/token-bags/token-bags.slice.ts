import { CaseReducer, createSlice } from "@reduxjs/toolkit";
import { receiveRemoteGameState, resetApp } from "../../store/global.actions";
import { ITokenBag, ITokenBagsState, initialState } from "./initialState";
import { addNewTokenBagWithId } from "./token-bags.actions";

// Reducers
const resetTokenBagsReducer: CaseReducer<ITokenBagsState> = (state) => {
  state.bags = [];
};

// slice
const playmatsSlice = createSlice({
  name: "token-bags",
  initialState: initialState,
  reducers: {
    resetTokenBags: resetTokenBagsReducer,
  },
  extraReducers: (builder) => {
    builder.addCase(receiveRemoteGameState, (state, action) => {
      // Playmats can be undefined if it's an older save file
      state.bags = action.payload.liveState.present.tokenBags?.bags ?? [];
    });

    builder.addCase(resetApp, (state, _action) => {
      state.bags = [];
    });

    builder.addCase(addNewTokenBagWithId, (state, action) => {
      const bag: ITokenBag = {
        bagImgUrl: action.payload.imgUrl,
        id: action.payload.id,
        position: action.payload.position,
        tokens: action.payload.initialTokens,
      };

      state.bags.push(bag);
    });
  },
});

export const { resetTokenBags } = playmatsSlice.actions;

export default playmatsSlice.reducer;
