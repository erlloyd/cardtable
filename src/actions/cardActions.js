import { CARD_MOVE, SELECT_MUTLIPLE_CARDS, UNSELECT_ALL_CARDS } from "./actionTypes";

export const simpleCardAction = (type, id) => {
  return (dispatch) => {
    dispatch({
      type: type,
      payload: {
        id
      }
    })
  }
}

export const cardMove = (id, dx, dy) => {
  return (dispatch) => {
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

export const selectMultipleCards = (ids) => {
  return (dispatch) => {
    dispatch({
      type: SELECT_MUTLIPLE_CARDS,
      payload: {
        ids
      }
    });
  }
}

export const unselectAllCards = () => {
  return (dispatch) => {
    dispatch({
      type: UNSELECT_ALL_CARDS,
      payload: {}
    });
  }
}