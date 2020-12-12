import { createSelector } from "@reduxjs/toolkit";
import { CardData } from "../../external-api/marvel-card-data";
import { RootState } from "../../store/rootReducer";
import { Set } from "../cards-data/initialState";

export interface IEncounterEntity {
  setCode: string;
  setData: Set;
  cards: CardData[];
}

export const getCardsData = (state: RootState) => state.cardsData;

export const getCardsDataEntities = createSelector(
  getCardsData,
  (cardsData) => {
    return { ...cardsData.entities, ...cardsData.encounterEntities };
  }
);

export const getCardsDataHeroEntities = createSelector(
  getCardsData,
  (cardsData) => {
    return cardsData.entities;
  }
);

export const getCardsDataEncounterEntities = createSelector(
  getCardsData,
  (cardsData) => {
    return cardsData.encounterEntities;
  }
);

export const getCardsDataSetData = createSelector(getCardsData, (cardsData) => {
  return cardsData.setData;
});

export const getCardsDataEncounterEntitiesBySetCode = createSelector(
  getCardsDataEncounterEntities,
  getCardsDataSetData,
  (encounterEntities, setData): IEncounterEntity[] => {
    const setTypesEncounters: { [key: string]: CardData[] } = {};

    Object.values(encounterEntities).forEach((encounterCard) => {
      const setCode = encounterCard.set_code || "unknown";
      if (!!setTypesEncounters[setCode]) {
        setTypesEncounters[setCode].push(encounterCard);
      } else {
        setTypesEncounters[setCode] = [encounterCard];
      }
    });

    return Object.entries(setTypesEncounters)
      .map(([key, value]) => ({
        setCode: key,
        setData: setData[key],
        cards: value,
      }))
      .filter(
        (set) =>
          set.setData.setTypeCode !== "nemesis" &&
          set.setData.setTypeCode !== "hero"
      )
      .sort((a, b) => (a.setData.setTypeCode > b.setData.setTypeCode ? 1 : -1));
  }
);
