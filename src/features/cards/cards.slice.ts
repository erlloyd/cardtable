import { createSlice, PayloadAction, CaseReducer } from '@reduxjs/toolkit'
import { initialState, ICardsState, ICard } from './initialState';

// Helper methods
const getCardWithId = (state: ICardsState, id: number ): ICard | undefined => {
  return state.cards.find( (card) => card.id === id);
}

const mutateCardWithId = (state: ICardsState, id: number, callback: (card: ICard) => void ) => {
  const cardToUpdate = getCardWithId(state, id);
  if (cardToUpdate) { callback(cardToUpdate) }
}

const foreachSelectedCard = (state: ICardsState, callback: (card: ICard) => void ) => {
  state.cards.filter(card => card.selected).forEach(card => callback(card));
}

// Reducers
const selectCardReducer: CaseReducer<ICardsState, PayloadAction<number>> = (state, action) => {
  mutateCardWithId(state, action.payload, (card) => {
    card.selected = !card.selected; 
  });
}

const exhaustCardReducer: CaseReducer<ICardsState, PayloadAction<number>> = (state, action) => {
  state.cards
    .filter( card => card.id === action.payload || card.selected)
    .forEach( (card) => {
      card.exhausted = !card.exhausted;
    })
}

const startCardMoveReducer: CaseReducer<ICardsState, PayloadAction<number>> = (state, action) => {
  // first, if the card moving isn't currently selected, clear all selected cards
  const cardToStartMoving = getCardWithId(state, action.payload);
  if (cardToStartMoving && !cardToStartMoving.selected) {
    state.cards = state.cards.map(card => {
      card.selected = card.id === action.payload;
      return card;
    });
  }

  // Now all selected cards should be put into ghost cards
  state.ghostCards = [];

  foreachSelectedCard(state, card => { 
    card.dragging = true;
    state.ghostCards.push(Object.assign({}, card));
  });
}

const cardMoveReducer: CaseReducer<ICardsState, PayloadAction<{id: number, dx: number, dy: number}>> = (state, action) => {
  const movedCards: ICard[] = [];
  
  state.cards
  .filter((card) => card.id === action.payload.id || card.selected)
  .forEach( (card) => {
    card.x += action.payload.dx;
    card.y += action.payload.dy;

    movedCards.push(card);
  });

  // put the moved cards at the end. TODO: we could just store the move order or move time 
  // or something, and the array could be a selector
  movedCards.forEach(movedCard => {
    state.cards.push(state.cards.splice(state.cards.indexOf(movedCard), 1)[0]);
  });
}

const endCardMoveReducer: CaseReducer<ICardsState, PayloadAction<number>> = (state, action) => {
  state.cards
  .filter((card) => card.id === action.payload || card.selected)
  .forEach((card) =>{
    card.dragging = false;
  });

  state.ghostCards = [];
}

const selectMultipleCardsReducer: CaseReducer<ICardsState, PayloadAction<{ ids: number[]}>> = (state, action) => {
  action.payload.ids
  .map( id => state.cards.find(card => card.id === id))
  .forEach( card => {
    if (card) {
      card.selected = true;
    }
  });
}

const unselectAllCardsReducer: CaseReducer<ICardsState> = (state) => {
  state.cards.forEach( (card) => {
    card.selected = false;
  });
}

const hoverCardReducer: CaseReducer<ICardsState, PayloadAction<number>> = (state, action) => {
  if (state.previewCard === null) {
    state.previewCard = {
      id: action.payload,
    }
  } else if ( action.payload !== state.previewCard.id) {
    state.previewCard.id = action.payload;
  }
}

const hoverLeaveCardReducer: CaseReducer<ICardsState> = (state) => {
  if (state.previewCard !== null) {
    state.previewCard = null;
  }
}

// Selectors


// slice

const cardsSlice = createSlice({
  name: 'cards',
  initialState: initialState,
  reducers: {
    selectCard: selectCardReducer,
    exhaustCard: exhaustCardReducer,
    startCardMove: startCardMoveReducer,
    cardMove: cardMoveReducer,
    endCardMove: endCardMoveReducer,
    selectMultipleCards: selectMultipleCardsReducer,
    unselectAllCards: unselectAllCardsReducer,
    hoverCard: hoverCardReducer,
    hoverLeaveCard: hoverLeaveCardReducer,
  },
});

export const { 
  selectCard,
  exhaustCard,
  startCardMove,
  cardMove,
  endCardMove,
  selectMultipleCards,
  unselectAllCards,
  hoverCard,
  hoverLeaveCard,
} = cardsSlice.actions;

export default cardsSlice.reducer;
