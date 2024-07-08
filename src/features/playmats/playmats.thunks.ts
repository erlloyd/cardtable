import { Action } from "redux";
import { ThunkAction } from "redux-thunk";
import { v4 } from "uuid";
import { RootState } from "../../store/rootReducer";
import {
  addNewPlaymatInColumnWithId,
  initBoardSlotsOnPlaymats,
} from "./playmats.actions";
import { getPlaymatsInColumnRowOrder } from "./playmats.selectors";
import { getActiveGameType } from "../game/game.selectors";
import { GameType } from "../../game-modules/GameType";

export const initBoardSlots =
  (): ThunkAction<void, RootState, unknown, Action<string>> =>
  (dispatch, getState) => {
    const extraPlaymats = getPlaymatsInColumnRowOrder(getState());
    const currentGameType =
      getActiveGameType(getState()) ?? GameType.MarvelChampions;
    dispatch(
      initBoardSlotsOnPlaymats({
        currentNumPlaymats: extraPlaymats.length,
        currentGameType,
      })
    );
  };

export const addNewPlaymatInColumn =
  (imgUrl: string): ThunkAction<void, RootState, unknown, Action<string>> =>
  (dispatch, getState) => {
    // Create a new id
    const newPlaymatId = v4();
    const extraPlaymats = getPlaymatsInColumnRowOrder(getState());
    const currentGameType =
      getActiveGameType(getState()) ?? GameType.MarvelChampions;
    dispatch(
      addNewPlaymatInColumnWithId({
        id: newPlaymatId,
        imgUrl,
        currentNumPlaymats: extraPlaymats.length,
        currentGameType,
      })
    );
  };
