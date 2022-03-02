import { Action } from "redux";
import { ThunkAction } from "redux-thunk";
import { myPeerRef } from "../../constants/app-constants";
import { RootState } from "../../store/rootReducer";
import { getCards } from "../cards/cards.selectors";
import { startNewArrowForCards } from "./arrows.slice";

export const startNewArrow =
  (
    specificCardId?: string
  ): ThunkAction<void, RootState, unknown, Action<string>> =>
  (dispatch, getState) => {
    // get all of the current selected cards for my peer ref
    const mySelectedCardIds = getCards(getState())
      .cards.filter((c) => c.controlledBy === myPeerRef)
      .map((c) => c.id);

    if (!!specificCardId && !mySelectedCardIds.includes(specificCardId)) {
      mySelectedCardIds.push(specificCardId);
    }
    dispatch(
      startNewArrowForCards({
        startCardIds: mySelectedCardIds,
        myRef: myPeerRef,
      })
    );
  };
