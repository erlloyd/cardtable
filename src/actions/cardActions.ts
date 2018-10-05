// tslint:disable:object-literal-sort-keys
import { CARD_MOVE, SELECT_MUTLIPLE_CARDS, UNSELECT_ALL_CARDS } from "./actionTypes";

export const simpleCardAction = (type: any, id: any) => {
  return (dispatch: any) => {
    dispatch({
      type,
      payload: {
        id
      }
    })
  }
}

export const cardMove = (id: any, dx: any, dy: any) => {
  return (dispatch: any) => {
    dispatch({
      type: CARD_MOVE,
      payload: {
        id,
        dx,
        dy
      }
    })
  }
}

export const selectMultipleCards = (ids: any) => {
  return (dispatch: any) => {
    dispatch({
      type: SELECT_MUTLIPLE_CARDS,
      payload: {
        ids
      }
    });
  }
}

export const unselectAllCards = () => {
  return (dispatch: any) => {
    dispatch({
      type: UNSELECT_ALL_CARDS,
      payload: {}
    });
  }
}