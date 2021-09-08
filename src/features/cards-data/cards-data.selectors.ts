import { createSelector } from "@reduxjs/toolkit";
import { CardData } from "../../external-api/common-card-data";
import { RootState } from "../../store/rootReducer";
import { ICardsDataState, Set } from "../cards-data/initialState";

export interface IEncounterEntity {
  setCode: string;
  setData: Set;
  cards: CardData[];
}

const getCurrentCardData = (cardsData: ICardsDataState) => {
  return (
    cardsData.data[cardsData.activeDataType] ?? {
      entities: {},
      encounterEntities: {},
      setData: {},
    }
  );
};

export const getCardsData = (state: RootState) => state.cardsData;

export const getCardsDataEntities = createSelector(
  getCardsData,
  (cardsData) => {
    const data = getCurrentCardData(cardsData);
    return { ...data.entities, ...data.encounterEntities };
  }
);

export const getCardsDataHeroEntities = createSelector(
  getCardsData,
  (cardsData) => {
    const data = getCurrentCardData(cardsData);
    return data.entities;
  }
);

export const getCardsDataHerosByName = createSelector(
  getCardsData,
  (cardsData) => {
    const data = getCurrentCardData(cardsData);
    let cardsDataByName: { [key: string]: CardData } = {};
    Object.values(data.entities).forEach((cd) => {
      if (cd.typeCode === "hero") {
        cardsDataByName[cd.name] = cd;
      }
    });
    return cardsDataByName;
  }
);

export const getCardsDataPlayerCardsByName = createSelector(
  getCardsData,
  (cardsData) => {
    const data = getCurrentCardData(cardsData);
    let cardsDataByName: { [key: string]: CardData } = {};
    Object.values(data.entities).forEach((cd) => {
      if (cd.typeCode !== "hero") {
        cardsDataByName[cd.name] = cd;
      }
    });
    return cardsDataByName;
  }
);

export const getCardsDataEncounterEntities = createSelector(
  getCardsData,
  (cardsData) => {
    const data = getCurrentCardData(cardsData);
    return data.encounterEntities;
  }
);

export const getCardsDataSetData = createSelector(getCardsData, (cardsData) => {
  const data = getCurrentCardData(cardsData);
  return data.setData;
});

export const getCardsDataSetDataAsEncounterEntities = createSelector(
  getCardsDataSetData,
  getCardsDataEncounterEntities,
  (setData, encounterEntities) => {
    return Object.entries(setData).map(([key, value]) => {
      const encounterEntity: IEncounterEntity = {
        setCode: key,
        setData: value,
        cards: value.cardsInSet.map((cis) => encounterEntities[cis.code]),
      };

      return encounterEntity;
    });
  }
);

export const getCardsDataEncounterEntitiesBySetCode = createSelector(
  getCardsDataEncounterEntities,
  getCardsDataHeroEntities,
  getCardsDataSetData,
  (encounterEntities, herosData, setData): IEncounterEntity[] => {
    const setTypesEncounters: { [key: string]: CardData[] } = {};

    const campaignCards = Object.values(herosData)
      .filter((pc) => pc.extraInfo.factionCode === "campaign")
      .sort((a, b) => (a.code < b.code ? -1 : a.code > b.code ? 1 : 0));

    Object.values(encounterEntities)
      .sort((a, b) => (a.code < b.code ? -1 : a.code > b.code ? 1 : 0))
      .concat(campaignCards)
      .forEach((encounterCard) => {
        const setCode = encounterCard.extraInfo.setCode || "unknown";
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
      .sort((a, b) => (a.setData.name > b.setData.name ? 1 : -1));
  }
);
