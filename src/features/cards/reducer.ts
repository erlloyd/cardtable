import { ActionType, getType } from 'typesafe-actions';
import * as cardActions from './actions';
import initialState, { ICard } from './initialState';
export type CardsAction = ActionType<typeof cardActions>;

export default (state = initialState.cards, action: CardsAction): ICard[] => {
  let newState: ICard[];
  switch (action.type) {
    case getType(cardActions.exhaustCard):
      newState = state.map((card) => {
        if(action.payload.id === card.id || card.selected) {
          card = Object.assign({}, card, {exhausted: !card.exhausted});
        }
        return card;
      });
      return newState;
    case getType(cardActions.startCardMove):
      newState = state.map((card) => {
        if(action.payload.id === card.id || card.selected) {
          card = Object.assign({}, card, {dragging: true});
        }
        return card;
      });
      return newState;
    case getType(cardActions.moveCard):
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
    case getType(cardActions.endCardMove):
      newState = state.map((card) => {
        if(action.payload.id === card.id || card.selected) {
          card = Object.assign({}, card, {dragging: false});
        }
        return card;
      });
      return newState;
    case getType(cardActions.selectCard):
      newState = state.map((card) => {
        if(action.payload.id === card.id) {
          card = Object.assign({}, card, {selected: true});
        }
        return card;
      });
      return newState;
    case getType(cardActions.selectMultipleCards):
      newState = state.map((card) => {
        if(action.payload.ids.some((id) => id === card.id)) {
          card = Object.assign({}, card, {selected: true});
        }
        return card;
      });
      return newState;
    case getType(cardActions.unselectAllCards):
    newState = state.map((card) => {
      return Object.assign({}, card, {selected: false});
    });
    return newState;
    default:
      return state;
  }
}