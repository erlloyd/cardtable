import { createSlice, PayloadAction, CaseReducer } from '@reduxjs/toolkit'
import { getDistance } from '../../utilities/geo';
import { initialState, ICardsState, ICardStack, ICardDetails } from './initialState';
import { v4 as uuidv4 } from 'uuid';

const CARD_DROP_TARGET_DISTANCE = 30;

// Helper methods
const getCardStackWithId = (state: ICardsState, id: string ): ICardStack | undefined => {
  return state.cards.find( (card) => card.id === id);
}

const mutateCardWithId = (state: ICardsState, id: string, callback: (card: ICardStack) => void ) => {
  const cardToUpdate = getCardStackWithId(state, id);
  if (cardToUpdate) { callback(cardToUpdate) }
}

const foreachSelectedCard = (state: ICardsState, callback: (card: ICardStack) => void ) => {
  state.cards.filter(card => card.selected).forEach(card => callback(card));
}

const foreachUnselectedCard = (state: ICardsState, callback: (card: ICardStack) => void ) => {
  state.cards.filter(card => !card.selected).forEach(card => callback(card));
}

// Reducers
const selectCardReducer: CaseReducer<ICardsState, PayloadAction<string>> = (state, action) => {
  mutateCardWithId(state, action.payload, (card) => {
    card.selected = !card.selected; 
  });
}

const exhaustCardReducer: CaseReducer<ICardsState, PayloadAction<string>> = (state, action) => {
  state.cards
    .filter( card => card.id === action.payload || card.selected)
    .forEach( (card) => {
      card.exhausted = !card.exhausted;
    })
}

const startCardMoveReducer: CaseReducer<ICardsState, PayloadAction<{id: string, splitTopCard: boolean}>> = (state, action) => {
  // first, if the card moving isn't currently selected, clear all selected cards  
  const cardToStartMoving = getCardStackWithId(state, action.payload.id);
  if (cardToStartMoving && !cardToStartMoving.selected) {
    state.cards = state.cards.map(card => {
      card.selected = card.id === action.payload.id;
      return card;
    });
  }

  // If we are splitting, make a new stack of cards
  if (action.payload.splitTopCard) {    
    const cardToMove = state.cards.find(c => c.id === action.payload.id);

    if (!cardToMove) {
      throw new Error('Expected to find card');
    }

    cardToMove.selected = false;

    const topCard = cardToMove.cardStack.shift();
    const newCard = Object.assign({}, cardToMove, {
      cardStack: [topCard]
    });

    cardToMove.id = uuidv4();

    state.cards.push(newCard);
  }


  // Now all selected cards should be put into ghost cards, unless we are splitting the top card
  state.ghostCards = [];

  if (!action.payload.splitTopCard) {
    foreachSelectedCard(state, card => { 
      card.dragging = true;
      state.ghostCards.push(Object.assign({}, card));
    });
  }
}

const cardMoveReducer: CaseReducer<ICardsState, PayloadAction<{id: string, dx: number, dy: number}>> = (state, action) => {
  const movedCards: ICardStack[] = [];
  
  let primaryCard: ICardStack;

  state.cards
  .filter((card) => card.id === action.payload.id || card.selected)
  .forEach( (card) => {
    if(card.id === action.payload.id) {
      primaryCard = card;
    }

    card.x += action.payload.dx;
    card.y += action.payload.dy;

    movedCards.push(card);
  });

  // go through and find if any unselected cards are potential drop targets
  // If so, get the closest one
  const possibleDropTargets: {distance: number, card: ICardStack}[] = [];
  foreachUnselectedCard(state, card => {
    const distance = getDistance(card, primaryCard);
    if(distance < CARD_DROP_TARGET_DISTANCE) {
      possibleDropTargets.push({
        distance,
        card
      });
    }
  });

  state.dropTargetCard = possibleDropTargets.sort((c1, c2) => c1.distance - c2.distance)[0]?.card ?? null;

  // put the moved cards at the end. TODO: we could just store the move order or move time 
  // or something, and the array could be a selector
  movedCards.forEach(movedCard => {
    state.cards.push(state.cards.splice(state.cards.indexOf(movedCard), 1)[0]);
  });
}

const endCardMoveReducer: CaseReducer<ICardsState, PayloadAction<string>> = (state, action) => {
  let dropTargetCards: ICardDetails[] = [];
  state.cards
  .filter((card) => card.id === action.payload || card.selected)
  .forEach((card) =>{
    card.dragging = false;

    if (!!state.dropTargetCard) {
      // Add the cards to the drop Target card stack
      dropTargetCards = dropTargetCards.concat(card.cardStack);
    }
  });

  // Now, if there was a drop target card, remove all those cards from the state
  if (!!state.dropTargetCard) {
    state.cards = state.cards.filter((card) => !(card.id === action.payload || card.selected));
    
    const dropTargetCard = state.cards.find(card => card.id === state.dropTargetCard?.id);
    if (!!dropTargetCard && dropTargetCards.length > 0) {

      // add the cards we've collected to the top of the stack
      dropTargetCard.cardStack = dropTargetCards.concat(dropTargetCard.cardStack);
    }
    
  }

  state.ghostCards = [];
  state.dropTargetCard = null;
}

const selectMultipleCardsReducer: CaseReducer<ICardsState, PayloadAction<{ ids: string[]}>> = (state, action) => {
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

const hoverCardReducer: CaseReducer<ICardsState, PayloadAction<string>> = (state, action) => {
  const cardToPreview = state.cards.find(c => c.id === action.payload);
  if (!cardToPreview?.faceup) return;

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

const togglePanModeReducer: CaseReducer<ICardsState> = (state) => {
  state.panMode = !state.panMode;
}

const flipCardsReducer: CaseReducer<ICardsState> = (state, action) => {
  state.cards
    .filter( card => card.selected)
    .forEach( (card) => {
      card.faceup = !card.faceup;
    })
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
    togglePanMode: togglePanModeReducer,
    flipCards: flipCardsReducer,
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
  togglePanMode,
  flipCards,
} = cardsSlice.actions;

export default cardsSlice.reducer;
