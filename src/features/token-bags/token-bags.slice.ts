import { CaseReducer, PayloadAction, createSlice } from "@reduxjs/toolkit";
import { receiveRemoteGameState, resetApp } from "../../store/global.actions";
import { ITokenBag, ITokenBagsState, initialState } from "./initialState";
import { addNewTokenBagWithId } from "./token-bags.actions";
import { Vector2d } from "konva/lib/types";

// Reducers
const resetTokenBagsReducer: CaseReducer<ITokenBagsState> = (state) => {
  state.bags = [];
};

const setTokenBagPositionReducer: CaseReducer<
  ITokenBagsState,
  PayloadAction<{ x: number; y: number; id: string }>
> = (state, action) => {
  // Get the bag matching that id and set the position
  const bag = state.bags.find((b) => b.id === action.payload.id);

  if (bag) {
    bag.position = { x: action.payload.x, y: action.payload.y };
  }
};

// slice
const playmatsSlice = createSlice({
  name: "token-bags",
  initialState: initialState,
  reducers: {
    resetTokenBags: resetTokenBagsReducer,
    setTokenBagPosition: setTokenBagPositionReducer,
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

export const { resetTokenBags, setTokenBagPosition } = playmatsSlice.actions;

export default playmatsSlice.reducer;
