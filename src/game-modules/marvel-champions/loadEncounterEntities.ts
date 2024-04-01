import { CardData } from "../../external-api/common-card-data";
import { IEncounterEntity } from "../../features/cards-data/cards-data.selectors";
import { ICardData, ISetData } from "../../features/cards-data/initialState";

export const loadEncounterEntities = (
  setData: ISetData,
  herosData: ICardData,
  encounterEntities: ICardData
): IEncounterEntity[] => {
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

  const setDataToReturn = Object.entries(setTypesEncounters)
    .filter(([key, _value]) => key !== "unknown")
    .map(([key, value]) => {
      const shouldSortCardsBySetPosition = value.every(
        (c) => !!c.extraInfo.setPosition !== undefined
      );
      return {
        setCode: key,
        setData: setData[key],
        cards: shouldSortCardsBySetPosition
          ? value.sort(
              (a, b) =>
                (a.extraInfo.setPosition ?? 0) - (b.extraInfo.setPosition ?? 0)
            )
          : value,
      };
    })
    .filter(
      (set) =>
        set.setData.setTypeCode !== "nemesis" &&
        set.setData.setTypeCode !== "hero"
    );

  // Go through and get the original index of every "type" of set
  const originalOrder = setDataToReturn.reduce((orderMap, entity, index) => {
    if (orderMap[entity.setData.setTypeCode] === undefined) {
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
