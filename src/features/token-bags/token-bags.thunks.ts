import { Action, ThunkAction } from "@reduxjs/toolkit";
import { v4 } from "uuid";
import GameManager from "../../game-modules/GameModuleManager";
import { GameType } from "../../game-modules/GameType";
import { RootState } from "../../store/rootReducer";
import { addNewTokenBagWithId } from "./token-bags.actions";
import { getTokenBagById, getTokenBags } from "./token-bags.selectors";
import { IToken } from "./initialState";
import { removeTokenFromBagWithCode } from "./token-bags.slice";
import { createNewTokens } from "../counters/counters.slice";

export interface CustomCard {
  id: string;
  name: string;
  landscape: boolean;
  frontImageUrl: string;
  backImageUrl: string;
  set?: string;
  setType?: string;
  loadOrder?: number;
  quantity?: number;
}

export const spawnTokenBags =
  (
    currentGameType: GameType
  ): ThunkAction<void, RootState, unknown, Action<string>> =>
  async (dispatch, getState) => {
    // First, check if there are already token bags in the game. If so, we assume
    // that they have already been loaded
    const existingTokenBags = getTokenBags(getState());
    if (existingTokenBags.length === 0) {
      // Get any token bags for the current game
      const bagsToSpawn =
        GameManager.getModuleForType(currentGameType).properties.tokenBags ??
        [];
      bagsToSpawn.forEach((b) =>
        dispatch(
          addNewTokenBagWithId({
            id: v4(),
            position: { x: 0, y: 0 },
            code: b.code,
            quantity: b.quantity,
            imgUrl: b.bagImgUrl,
            initialTokens: b.tokens,
          })
        )
      );
    }
  };

export const drawRandomTokenFromBag =
  (bagId: string): ThunkAction<void, RootState, unknown, Action<string>> =>
  async (dispatch, getState) => {
    const bag = getTokenBagById(bagId)(getState());

    if (!bag) return;
    //Get all the tokens in the bag
    let allTokens: IToken[] = [];
    bag.tokens.forEach((t) => {
      allTokens = allTokens.concat(
        Array.from({ length: t.currentNumberInBag }).map((_i) => t)
      );
    });

    if (allTokens.length === 0) return;

    const randomToken = allTokens[Math.floor(Math.random() * allTokens.length)];

    console.log("drawing token ", randomToken);

    dispatch(
      removeTokenFromBagWithCode({ id: bag.id, code: randomToken.code })
    );

    dispatch(
      createNewTokens([
        {
          position: {
            x: bag.position.x + 400 + Math.random() * 50,
            y: bag.position.y + Math.random() * 50,
          },
          id: v4(),
          faceup: true,
          imgUrl: randomToken.frontImgUrl,
          backImgUrl: randomToken.backImgUrl,
          controlledBy: null,
          code: randomToken.code,
        },
      ])
    );
  };
