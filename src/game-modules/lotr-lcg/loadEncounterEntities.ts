import { IEncounterEntity } from "../../features/cards-data/cards-data.selectors";
import { ICardData, ISetData } from "../../features/cards-data/initialState";

export const loadEncounterEntities = (
  setData: ISetData,
  _herosData: ICardData,
  encounterEntities: ICardData
): IEncounterEntity[] => {
  const setDataToReturn = Object.entries(setData).map(([key, value]) => {
    const encounterEntity: IEncounterEntity = {
      setCode: key,
      setData: value,
      cards: value.cardsInSet.map((cis) => encounterEntities[cis.code]),
    };

    return encounterEntity;
  });

  // Go through and get the original index of every "type" of set
  const originalOrder = setDataToReturn.reduce((orderMap, entity, index) => {
    if (!orderMap[entity.setData.setTypeCode]) {
      orderMap[entity.setData.setTypeCode] = index;
    }

    return orderMap;
  }, {} as { [key: string]: number });

  return setDataToReturn.sort(
    (a, b) =>
      originalOrder[a.setData.setTypeCode] -
      originalOrder[b.setData.setTypeCode]
  );
};
