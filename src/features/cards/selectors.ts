import { createSelector } from 'reselect';
import Types from 'Types';

export const getCards = (state: Types.RootState) => state.cards;

export const shouldShowPreview = createSelector(getCards, (cards) => {
  return !!cards.previewCard && cards.cards.every(card => !card.dragging);
});