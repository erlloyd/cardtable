import { createSelector } from "@reduxjs/toolkit";
import { GameType } from "../../game-modules/GameType";
import { CardData } from "../../external-api/common-card-data";
import { RootState } from "../../store/rootReducer";
import {
  ICardData,
  ICardsDataStateUserView,
  IGameCardsDataState,
  ISetData,
  Set,
} from "../cards-data/initialState";
import GameManager from "../../game-modules/GameModuleManager";

export type ICardSetToLoad = IEncounterEntity;

export interface IEncounterEntity {
  setCode: string;
  setData: Set;
  cards: CardData[];
}

const getCurrentCardData = (cardsData: ICardsDataStateUserView) => {
  return (
    cardsData.data[cardsData.activeDataType] ?? {
      entities: {},
      encounterEntities: {},
      setData: {},
    }
  );
};

export const getRawCardsData = (state: RootState) => state.cardsData;

export const getCardsData = createSelector(
  getRawCardsData,
  (rawCardsData): ICardsDataStateUserView => {
    // TODO: When we have the option for a player to pick
    // which version of a card they want to use, we
    // should probably apply that here once. For now this
    // will just map everything

    const dataToReturn: { [key in GameType]?: IGameCardsDataState } = {};

    for (const gameTypeRaw in rawCardsData.data) {
      const gameType = gameTypeRaw as GameType;

      const useAltArt =
        !!GameManager.getModuleForType(gameType).properties
          .useAltCardArtByDefault;

      const data = rawCardsData.data[gameType];
      if (data !== undefined) {
        // This is stupid, have to do it for typescript
        const eData = data;
        const flattenedEntities = Object.keys(data.entities).reduce(
          (result, key) => {
            const index = useAltArt ? eData.entities[key].length - 1 : 0;
            result[key] = eData.entities[key][index];
            return result;
          },
          {} as ICardData
        );

        const flattenedEncounterEntities = Object.keys(
          data.encounterEntities
        ).reduce((result, key) => {
          const index = useAltArt ? eData.encounterEntities[key].length - 1 : 0;
          result[key] = eData.encounterEntities[key][index];
          return result;
        }, {} as ICardData);

        dataToReturn[gameType as GameType] = {
          entities: flattenedEntities,
          encounterEntities: flattenedEncounterEntities,
          setData: data.setData,
        };
      }
    }
    return { activeDataType: rawCardsData.activeDataType, data: dataToReturn };
  }
);

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

export const getCardsDataHeroEntitiesArrayWithoutDuplicates = createSelector(
  getCardsDataHeroEntities,
  (cardsData) => {
    return Object.values(cardsData).filter((c) => !c.duplicate_of);
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

export const getCardsDataEncounterEntitiesArrayWithoutDuplicates =
  createSelector(getCardsDataEncounterEntities, (cardsData) => {
    return Object.values(cardsData).filter((c) => !c.duplicate_of);
  });

export const getAllCardsDataEntitesArrayWithoutDuplicates = createSelector(
  getCardsDataHeroEntitiesArrayWithoutDuplicates,
  getCardsDataEncounterEntitiesArrayWithoutDuplicates,
  (heroCards, encounterCards) => heroCards.concat(encounterCards)
);

export const getCardsDataSetData = createSelector(getCardsData, (cardsData) => {
  const data = getCurrentCardData(cardsData);
  return data.setData;
});

export const getEncounterEntities = (
  gameType: GameType,
  customCards: boolean
) =>
  createSelector(
    getCardsDataSetData,
    getCardsDataHeroEntities,
    getCardsDataEncounterEntities,
    (setData, herosData, encounterEntities): IEncounterEntity[] => {
      // Now filter to either exclude or include custom cards, depending
      // on the value passed in

      const customSetData = {} as ISetData;

      const herosDataFiltered = Object.entries(herosData).reduce(
        (result, [key, value]) => {
          if (!customCards && !value.customCard) {
            result[key] = herosData[key];
          } else if (customCards && !!value.customCard) {
            result[key] = herosData[key];

            //Add a new set info if it doesn't exist
            if (
              value.extraInfo.setCode &&
              !setData[value.extraInfo.setCode] &&
              !customSetData[value.extraInfo.setCode]
            ) {
              customSetData[value.extraInfo.setCode] = {
                name: value.extraInfo.setCode,
                cardsInSet: [],
                setTypeCode: value.extraInfo.setType ?? "Custom",
              };
            }
          }
          return result;
        },
        {} as ICardData
      );

      const encounterDataFiltered = Object.entries(encounterEntities).reduce(
        (result, [key, value]) => {
          if (!customCards && !value.customCard) {
            result[key] = encounterEntities[key];
          } else if (customCards && !!value.customCard) {
            result[key] = encounterEntities[key];

            //Add a new set info if it doesn't exist
            if (
              value.extraInfo.setCode &&
              !setData[value.extraInfo.setCode] &&
              !customSetData[value.extraInfo.setCode]
            ) {
              customSetData[value.extraInfo.setCode] = {
                name: value.extraInfo.setCode,
                cardsInSet: [],
                setTypeCode: value.extraInfo.setType ?? "Custom",
              };
            }
          }
          return result;
        },
        {} as ICardData
      );

      let returnVal = [] as IEncounterEntity[];

      if (customCards) {
        returnVal = GameManager.getModuleForType(
          gameType
        ).getCustomLoadSetsFromState(
          { ...setData, ...customSetData },
          herosDataFiltered,
          encounterDataFiltered
        );
      } else {
        returnVal = GameManager.getModuleForType(
          gameType
        ).getEncounterEntitiesFromState(
          { ...setData, ...customSetData },
          herosDataFiltered,
          encounterDataFiltered,
          customCards
        );
      }
      return returnVal;
    }
  );

// export const getCardsDataSetDataAsEncounterEntities = createSelector(
//   getCardsDataSetData,
//   getCardsDataEncounterEntities,
//   (setData, encounterEntities) => {}
// );

// export const getCardsDataEncounterEntitiesBySetCode = createSelector(
//   getCardsDataEncounterEntities,
//   getCardsDataHeroEntities,
//   getCardsDataSetData,
//   (encounterEntities, herosData, setData): IEncounterEntity[] => {

//   }
// );
