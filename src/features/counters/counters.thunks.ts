import { Vector2d } from "konva/lib/types";
import { Action } from "redux";
import { ThunkAction } from "redux-thunk";
import { v4 as uuidv4 } from "uuid";
import { RootState } from "../../store/rootReducer";
import { addNewCounterWithId } from "./counters.actions";
import { myPeerRef, PlayerColor } from "../../constants/app-constants";
import {
  moveToken,
  movingTokens,
  removeTokens,
  selectMultipleTokens,
  selectToken,
  unselectAllTokens,
  unselectMultipleTokens,
  unselectToken,
} from "./counters.slice";
import {
  getCurrentTokens,
  tokensSelectedWithPeerRef,
} from "./counters.selectors";
import { getGame } from "../game/game.selectors";
import { getMultiselectMode } from "../cards/cards.selectors";
import { getTokenBags } from "../token-bags/token-bags.selectors";
import { ITokenBag } from "../token-bags/initialState";
import { tokenBagConstants } from "../../constants/card-constants";
import { addMultipleTokensToBagWithCode } from "../token-bags/token-bags.slice";

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
  (payload: {
    ids: string[];
    forceSelected?: boolean;
    forceMultiSelectMode?: boolean;
  }): ThunkAction<void, RootState, unknown, Action<string>> =>
  (dispatch, getState) => {
    // get the token
    let tokens = getCurrentTokens(getState());
    // get current multiselect mode
    const multiselectMode =
      getMultiselectMode(getState()) || !!payload.forceMultiSelectMode;

    if (!multiselectMode) {
      dispatch(unselectAllTokens(""));

      // get updated view of tokens
      tokens = getCurrentTokens(getState());
    }

    const tokensToSelect: string[] = [];
    const tokensToUnselect: string[] = [];

    payload.ids.forEach((id) => {
      const token = tokens.find((t) => t.id === id);

      if (!token) return;

      if (payload.forceSelected) {
        tokensToSelect.push(id);
      } else {
        if (token.controlledBy === myPeerRef) {
          tokensToUnselect.push(id);
        } else if (!token.controlledBy) {
          tokensToSelect.push(id);
        }
      }
    });

    dispatch(selectMultipleTokens(tokensToSelect));
    dispatch(unselectMultipleTokens(tokensToUnselect));
  };

export const handleTokenMove =
  (info: {
    id: string;
    dx: number;
    abs_x?: number;
    dy: number;
    abs_y?: number;
  }): ThunkAction<void, RootState, unknown, Action<string>> =>
  (dispatch, getState) => {
    // get all of the selected toeksn for the person that are dragging
    // so we can calculate their new positions.
    const myDraggingTokens = tokensSelectedWithPeerRef(myPeerRef)(getState());
    // for each of the cards, apply the dx / dy
    const absPosMap = {} as { [key: string]: Vector2d };

    myDraggingTokens.forEach((t) => {
      absPosMap[t.id] = {
        x: t.position.x + info.dx,
        y: t.position.y + info.dy,
      };
    });

    //Now overwirte this card in the map with the abs pos
    if (info.abs_x !== undefined && info.abs_y !== undefined) {
      absPosMap[info.id] = { x: info.abs_x, y: info.abs_y };
    }

    dispatch(movingTokens({ idToPosMap: absPosMap }));
  };

export const handleTokenEndMove =
  (info: {
    id: string;
    pos: Vector2d;
  }): ThunkAction<void, RootState, unknown, Action<string>> =>
  (dispatch, getState) => {
    // First get all token bags
    const tokenBags = getTokenBags(getState());

    const hitTokenBags = tokenBags.filter(
      (tb) =>
        info.pos.x > tb.position.x + 75 &&
        info.pos.x < tb.position.x + tokenBagConstants.TOKEN_BAG_WIDTH - 75 &&
        info.pos.y > tb.position.y + 75 &&
        info.pos.y < tb.position.y + tokenBagConstants.TOKEN_BAG_HEIGHT - 75
    );

    let dropTokenBag: ITokenBag | null = null;
    if (hitTokenBags.length > 0) {
      dropTokenBag = hitTokenBags[0];
    }

    if (dropTokenBag) {
      // get all selected tokens
      const allMyTokens = tokensSelectedWithPeerRef(myPeerRef)(getState());

      const tokenIdsToRemove: string[] = [];
      const tokenCodesToAdd: string[] = [];
      allMyTokens.forEach((t) => {
        tokenIdsToRemove.push(t.id);
        tokenCodesToAdd.push(t.code);
      });

      dispatch(removeTokens(tokenIdsToRemove));
      dispatch(
        addMultipleTokensToBagWithCode({
          id: dropTokenBag.id,
          codes: tokenCodesToAdd,
        })
      );
    } else {
      dispatch(moveToken(info));
    }
  };
