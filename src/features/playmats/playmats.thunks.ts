import { Action } from "redux";
import { ThunkAction } from "redux-thunk";
import { v4 } from "uuid";
import { RootState } from "../../store/rootReducer";
import { addNewPlaymatInColumnWithId } from "./playmats.actions";

export const addNewPlaymatInColumn =
  (imgUrl: string): ThunkAction<void, RootState, unknown, Action<string>> =>
  (dispatch, _getState) => {
    // Create a new id
    const newPlaymatId = v4();
    dispatch(
      addNewPlaymatInColumnWithId({
        id: newPlaymatId,
        imgUrl,
      })
    );
  };
