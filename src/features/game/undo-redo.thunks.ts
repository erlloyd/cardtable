import { Action, ThunkAction } from "@reduxjs/toolkit";
import { ActionCreators } from "redux-undo";
import { RootState } from "../../store/rootReducer";

import { debounce } from "lodash";
import { endUndoRedo, startUndoRedo } from "./game.slice";
import { isUndoing } from "./game.selectors";

const dispatchEnd = debounce((dispatch: any) => {
  dispatch(endUndoRedo());
}, 1000);

export const undo =
  (): ThunkAction<void, RootState, unknown, Action<any>> =>
  async (dispatch, getState) => {
    if (!isUndoing(getState())) {
      dispatch(startUndoRedo());
    }
    dispatch(ActionCreators.undo());
    dispatchEnd(dispatch);
  };

export const redo =
  (): ThunkAction<void, RootState, unknown, Action<any>> =>
  async (dispatch, getState) => {
    if (!isUndoing(getState())) {
      dispatch(startUndoRedo());
    }
    dispatch(ActionCreators.redo());
    dispatchEnd(dispatch);
  };
