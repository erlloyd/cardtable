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
      newState = state;
      // first, if the current card isn't selected, clear the selection
      if (state.some(card => card.id === action.payload.id && !card.selected)) {
        newState = state.map((card) => {
          if(card.selected) {
            card = Object.assign({}, card, {selected: false});
          }
          return card;
        });
      }
      newState = newState.map((card) => {
        if(action.payload.id === card.id || card.selected) {
          card = Object.assign({}, card, {dragging: true});
        }
        return card;
      });
      return newState;
    case getType(cardActions.moveCard):
      const movedCards: ICard[] = [];
      newState = state.map((card) => {
        if(action.payload.id === card.id || card.selected) {
          card = Object.assign(
            {},
            card,
            {
              x: card.x + action.payload.dx,
              y: card.y + action.payload.dy
            });

            movedCards.push(card);
        }
        return card;
      });

      // move that cards that were moved to the end. TODO: we could just store the move order or move time 
      // or something, and the array could be a selector
      movedCards.forEach(movedCard => {
        newState.push(newState.splice(newState.indexOf(movedCard), 1)[0]);
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
          card = Object.assign({}, card, {selected: !card.selected});
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