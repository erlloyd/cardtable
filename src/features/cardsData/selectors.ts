import { createSelector } from 'reselect';
import Types from 'Types';

export const getCardsData = (state: Types.RootState) => state.cardsData;

export const get3RandomCards = createSelector(getCardsData, (cardsData) => {

  if (cardsData.metadata.length < 3) {
    return [];
  }

  const randomNums = [Math.floor(Math.random()*cardsData.metadata.length),
    Math.floor(Math.random()*cardsData.metadata.length),
    Math.floor(Math.random()*cardsData.metadata.length)];
  return randomNums
    .map(index => cardsData.metadata[index]);
});