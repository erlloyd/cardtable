import { Action, ThunkAction } from "@reduxjs/toolkit";
import { v4 } from "uuid";
import GameManager from "../../game-modules/GameModuleManager";
import { GameType } from "../../game-modules/GameType";
import { RootState } from "../../store/rootReducer";
import { addNewTokenBagWithId } from "./token-bags.actions";
import { getTokenBags } from "./token-bags.selectors";

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
            imgUrl: b.bagImgUrl,
            initialTokens: b.tokens,
          })
        )
      );
    }
  };
