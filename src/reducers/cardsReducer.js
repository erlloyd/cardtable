import initialState from './initialState';
import {
  EXHAUST_CARD,
  START_CARD_MOVE,
  CARD_MOVE,
  END_CARD_MOVE,
} from '../actions/actionTypes';

export default function app(state = initialState.cards, action) {
  let newState;
  switch (action.type) {
    case EXHAUST_CARD:
      console.log('EXHAUST_CARD action');
      newState = state.map((card) => {
        if(action.payload.id === card.id) {
          card = Object.assign({}, card, {exhausted: !card.exhausted});
        }
        return card;
      });
      return newState;
    case START_CARD_MOVE:
      console.log('START_CARD_MOVE action');
      newState = state.map((card) => {
        if(action.payload.id === card.id) {
          card = Object.assign({}, card, {dragging: true});
        }
        return card;
      });
      return newState;
    case CARD_MOVE:
      console.log('CARD_MOVE action');
      newState = state.map((card) => {
        if(action.payload.id === card.id) {
          card = Object.assign(
            {},
            card,
            {
              x: action.payload.x,
              y: action.payload.y
            });
        }
        return card;
      });
      return newState;
    case END_CARD_MOVE:
      console.log('END_CARD_MOVE action');
      newState = state.map((card) => {
        if(action.payload.id === card.id) {
          card = Object.assign({}, card, {dragging: false});
        }
        return card;
      });
      return newState;
    default:
      return state;
  }
}