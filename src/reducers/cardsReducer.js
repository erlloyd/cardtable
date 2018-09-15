import initialState from './initialState';
import {
  EXHAUST_CARD,
  START_CARD_MOVE,
  CARD_MOVE,
  END_CARD_MOVE,
  SELECT_CARD,
  SELECT_MUTLIPLE_CARDS,
  UNSELECT_ALL_CARDS,
} from '../actions/actionTypes';

export default function app(state = initialState.cards, action) {
  let newState;
  switch (action.type) {
    case EXHAUST_CARD:
      newState = state.map((card) => {
        if(action.payload.id === card.id || card.selected) {
          card = Object.assign({}, card, {exhausted: !card.exhausted});
        }
        return card;
      });
      return newState;
    case START_CARD_MOVE:
      newState = state.map((card) => {
        if(action.payload.id === card.id || card.selected) {
          card = Object.assign({}, card, {dragging: true});
        }
        return card;
      });
      return newState;
    case CARD_MOVE:
      newState = state.map((card) => {
        if(action.payload.id === card.id || card.selected) {
          card = Object.assign(
            {},
            card,
            {
              x: card.x + action.payload.dx,
              y: card.y + action.payload.dy
            });
        }
        return card;
      });
      return newState;
    case END_CARD_MOVE:
      newState = state.map((card) => {
        if(action.payload.id === card.id || card.selected) {
          card = Object.assign({}, card, {dragging: false});
        }
        return card;
      });
      return newState;
    case SELECT_CARD:
      newState = state.map((card) => {
        if(action.payload.id === card.id) {
          card = Object.assign({}, card, {selected: true});
        }
        return card;
      });
      return newState;
    case SELECT_MUTLIPLE_CARDS:
      newState = state.map((card) => {
        if(action.payload.ids.some(id => id === card.id)) {
          card = Object.assign({}, card, {selected: true});
        }
        return card;
      });
      return newState;
    case UNSELECT_ALL_CARDS:
    newState = state.map((card) => {
      return Object.assign({}, card, {selected: false});
    });
    return newState;
    default:
      return state;
  }
}