import { Vector2d } from "konva/lib/types";
import { Action } from "redux";
import { ThunkAction } from "redux-thunk";
import { v4 as uuidv4 } from "uuid";
import { RootState } from "../../store/rootReducer";
import { addNewCounterWithId } from "./counters.actions";
import { myPeerRef, PlayerColor } from "../../constants/app-constants";
import {
  selectToken,
  unselectAllTokens,
  unselectToken,
} from "./counters.slice";
import { getCurrentTokens } from "./counters.selectors";
import { getGame } from "../game/game.selectors";
import { getMultiselectMode } from "../cards/cards.selectors";

export const addNewCounter =
  (
    pos: Vector2d,
    imgUrl?: string,
    text?: string,
    color?: PlayerColor
  ): ThunkAction<void, RootState, unknown, Action<string>> =>
  (dispatch) => {
    const payloadWithId = {
      pos,
      imgUrl,
      text,
      color,
      id: uuidv4(),
    };
    dispatch(addNewCounterWithId(payloadWithId));
  };

export const handleTokenSelect =
  (
    id: string,
    forceSelected?: boolean
  ): ThunkAction<void, RootState, unknown, Action<string>> =>
  (dispatch, getState) => {
    // get the token
    const tokens = getCurrentTokens(getState());
    const token = tokens.find((t) => t.id === id);

    if (!token) return;

    // get current multiselect mode
    const multiselectMode = getMultiselectMode(getState());

    if (!multiselectMode) {
      dispatch(unselectAllTokens(""));
    }

    if (forceSelected) {
      dispatch(selectToken(id));
    } else {
      if (token.controlledBy === myPeerRef) {
        dispatch(unselectToken(id));
      } else if (!token.controlledBy) {
        dispatch(selectToken(id));
      }
    }
  };
