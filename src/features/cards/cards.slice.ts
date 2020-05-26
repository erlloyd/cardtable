import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { initialState, ICardsState } from './initialState';

const cardsSlice = createSlice({
  name: 'cards',
  initialState: initialState,
  reducers: {
    selectCard(state: ICardsState, action: PayloadAction<number>) {
      const id = action.payload
      const cardToUpdate = state.cards.find( (card) => card.id === id)
      if (cardToUpdate) { cardToUpdate.selected = true; }
    },
  },
});

export const { selectCard } = cardsSlice.actions;

export default cardsSlice.reducer;
