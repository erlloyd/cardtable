import { createSelector } from '@reduxjs/toolkit';
import { RootState } from '../../store/rootReducer';

export const getCards = (state: RootState) => state.cards;

export const shouldShowPreview = createSelector(getCards, (cards) => {
  return !!cards.previewCard && cards.cards.every(card => !card.dragging);
});

export const getPanMode = (state: RootState) => state.cards.panMode;