import { CaseReducer, PayloadAction, createSlice } from "@reduxjs/toolkit";
import { receiveRemoteGameState, resetApp } from "../../store/global.actions";
import { ITokenBag, ITokenBagsState, initialState } from "./initialState";
import { addNewTokenBagWithId } from "./token-bags.actions";
import { Vector2d } from "konva/lib/types";
import { CardtableAction } from "../../constants/app-constants";

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

const addTokenToBagWithCodeReducer: CaseReducer<
  ITokenBagsState,
  CardtableAction<{ id: string; code: string }>
> = (state, action) => {
  // Get the bag matching that id and set the position
  const bag = state.bags.find((b) => b.id === action.payload.id);

  if (bag) {
    const token = bag.tokens.find((t) => t.code === action.payload.code);
    if (token) {
      token.currentNumberInBag += 1;
    } else {
      // TODO, go see if the properties for token bag tokens for this game
      // have a token type with this code, if so, add it to the state with a value of 1
    }
  }
};

const removeTokenFromBagWithCodeReducer: CaseReducer<
  ITokenBagsState,
  CardtableAction<{ id: string; code: string }>
> = (state, action) => {
  // Get the bag matching that id and set the position
  const bag = state.bags.find((b) => b.id === action.payload.id);

  if (bag) {
    const token = bag.tokens.find((t) => t.code === action.payload.code);
    if (token && token.currentNumberInBag > 0) {
      token.currentNumberInBag -= 1;
    }
  }
};

// slice
const playmatsSlice = createSlice({
  name: "token-bags",
  initialState: initialState,
  reducers: {
    resetTokenBags: resetTokenBagsReducer,
    setTokenBagPosition: setTokenBagPositionReducer,
    addTokenToBagWithCode: addTokenToBagWithCodeReducer,
    removeTokenFromBagWithCode: removeTokenFromBagWithCodeReducer,
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
      for (let i = 0; i < action.payload.quantity; i++) {
        const bag: ITokenBag = {
          bagImgUrl: action.payload.imgUrl,
          code: action.payload.code,
          quantity: action.payload.quantity,
          id: action.payload.id,
          position: action.payload.position,
          tokens: action.payload.initialTokens,
        };

        state.bags.push(bag);
      }
    });
  },
});

export const {
  resetTokenBags,
  setTokenBagPosition,
  addTokenToBagWithCode,
  removeTokenFromBagWithCode,
} = playmatsSlice.actions;

export default playmatsSlice.reducer;
