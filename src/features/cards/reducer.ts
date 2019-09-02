import { ActionType, getType } from 'typesafe-actions';
import * as cardActions from './actions';
import initialState, { ICard, ICardsState } from './initialState';
export type CardsAction = ActionType<typeof cardActions>;

export default (baseState = initialState, action: CardsAction): ICardsState => {
  const prevCards = baseState.cards;
  let newCards: ICard[];
  const newState: ICardsState = {
    cards: baseState.cards,
    ghostCards: baseState.ghostCards
  }
  switch (action.type) {
    case getType(cardActions.exhaustCard):
      newCards = prevCards.map((card) => {
        if(action.payload.id === card.id || card.selected) {
          card = Object.assign({}, card, {exhausted: !card.exhausted});
        }
        return card;
      });
      newState.cards = newCards;
      return newState;
    case getType(cardActions.startCardMove):
      newCards = prevCards;
      // first, if the current card isn't selected, clear the selection
      if (prevCards.some(card => card.id === action.payload.id && !card.selected)) {
        newCards = prevCards.map((card) => {
          if(card.selected) {
            card = Object.assign({}, card, {selected: false});
          }
          return card;
        });
      }
      newCards = newCards.map((card) => {
        if(action.payload.id === card.id || card.selected) {
          card = Object.assign({}, card, {dragging: true});
        }
        return card;
      });
      const ghostCards = prevCards.reduce<ICard[]>( 
        (currGhostCards, card) =>{
          if(action.payload.id === card.id || card.selected) {
            currGhostCards.push(Object.assign({}, card));
          }
          return currGhostCards;
        },[]);

      newState.cards = newCards;
      newState.ghostCards = ghostCards;
      return newState;
    case getType(cardActions.moveCard):
      const movedCards: ICard[] = [];
      newCards = prevCards.map((card) => {
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
        newCards.push(newCards.splice(newCards.indexOf(movedCard), 1)[0]);
      });
      
      newState.cards = newCards;
      return newState;
    case getType(cardActions.endCardMove):
      newCards = prevCards.map((card) => {
        if(action.payload.id === card.id || card.selected) {
          card = Object.assign({}, card, {dragging: false});
        }
        return card;
      });
      newState.cards = newCards;
      newState.ghostCards = [];
      return newState;
    case getType(cardActions.selectCard):
      newCards = prevCards.map((card) => {
        if(action.payload.id === card.id) {
          card = Object.assign({}, card, {selected: !card.selected});
        }
        return card;
      });
      newState.cards = newCards;
      return newState;
    case getType(cardActions.selectMultipleCards):
      newCards = prevCards.map((card) => {
        if(action.payload.ids.some((id) => id === card.id)) {
          card = Object.assign({}, card, {selected: true});
        }
        return card;
      });
      newState.cards = newCards;
      return newState;
    case getType(cardActions.unselectAllCards):
      newCards = prevCards.map((card) => {
        return Object.assign({}, card, {selected: false});
      });
      newState.cards = newCards;
      return newState;
    default:
      return baseState;
  }
}