import { createSelector } from 'reselect';
import Types from 'Types';

export const getCardsData = (state: Types.RootState) => state.cardsData;

export const getPlayerCardsData = createSelector(getCardsData, (cardsData) => {
  return cardsData.metadata
    .filter(data => data.EncounterInfo === null);
})

export const get3RandomCardDatas = createSelector(getCardsData, (cardsData) => {
  return getNRandomFromArray(3, cardsData.metadata)
});

export const get3RandomPlayerCardDatas = createSelector(getPlayerCardsData, (metadata) => {
  return getNRandomFromArray(3, metadata)
});

const getNRandomFromArray = <T>(n: number, items: T[]): T[] => {
  if (n < 0) {
    throw new Error('Number of items specified must not be negative');
  }

  if (n === 0 || items.length < n) {
    return [];
  }

  const randomNums = [Math.floor(Math.random()*items.length),
    Math.floor(Math.random()*items.length),
    Math.floor(Math.random()*items.length)];
  return randomNums
    .map(index => items[index]);
}