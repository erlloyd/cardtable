import { CARD_MOVE } from "./actionTypes";

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

export const cardMove = (id, x, y) => {
  return (dispatch) => {
    dispatch({
      type: CARD_MOVE,
      payload: {
        id,
        x,
        y
      }
    })
  }
}