import { Vector2d } from "konva/lib/types";
import { v4 as uuidv4 } from "uuid";
import { getCardsDataHeroEntities } from "../../features/cards-data/cards-data.selectors";
import { ICardData } from "../../features/cards-data/initialState";
import { ICardDetails } from "../../features/cards/initialState";
import { RootState } from "../../store/rootReducer";
import { GameType } from "../GameType";
import { fixCardCode } from "../common-utils";
import { MarvelDeckData } from "../marvel-champions/getMarvelCards";

export interface ArkhamDeckData {
  name: string;
  investigator_code: string;
  slots: { [key: string]: number };
}

export const getArkhamCards = (
  response: { data: ArkhamDeckData },
  state: RootState,
  payload: { gameType: GameType; decklistId: number; position: Vector2d }
) => {
  const heroCardsData = getCardsDataHeroEntities(state);

  return {
    position: payload.position,
    heroId: uuidv4(),
    data: fixSlotsCardCodes(
      replaceDuplicateCardsAndBasicWeakness(response.data, heroCardsData)
    ),
    dataId: uuidv4(),
    extraHeroCards: [],
    relatedEncounterDeck: [],
    encounterDeckId: uuidv4(),
    relatedObligationDeck: [],
    obligationDeckId: uuidv4(),
  };
};

const fixCodeList = (list: string[]) => list.map((l) => fixCardCode(l));

const fixCardDetailsCardCodes = (details: ICardDetails[]): ICardDetails[] =>
  details.map((d) => ({ jsonId: fixCardCode(d.jsonId) }));

const fixSlotsCardCodes = (data: ArkhamDeckData): ArkhamDeckData => {
  // Some cards (in LOTR I've found are special in rings db but aren't represented in the
  // data as such. These cards are prefixed with `99`. So if we find any card codes starting
  // with 99, just remove the 99
  const fixedSlots: { [key: string]: number } = Object.keys(data.slots).reduce(
    (newSlots, key) => {
      newSlots[fixCardCode(key)] = data.slots[key];
      return newSlots;
    },
    {} as { [key: string]: number }
  );

  return { ...data, slots: fixedSlots };
};

const replaceDuplicateCardsAndBasicWeakness = (
  data: ArkhamDeckData,
  heroData: ICardData
): ArkhamDeckData => {
  const newSlots: { [key: string]: number } = {};

  let needsBasicWeakness: boolean = false;

  Object.keys(data.slots).forEach((jsonId) => {
    if (jsonId === "01000") {
      needsBasicWeakness = true;
      return;
    }
    const cardData = heroData[jsonId];
    if (cardData && cardData.duplicate_of) {
      // Go all the way down the `duplicate_of` chain
      let currentCardData = cardData;
      while (currentCardData.duplicate_of) {
        currentCardData = heroData[currentCardData.duplicate_of];
      }
      newSlots[currentCardData.code] = data.slots[jsonId];
    } else {
      newSlots[jsonId] = data.slots[jsonId];
    }
  });

  // If we need a basic weakness, go get one
  if (needsBasicWeakness) {
    const basicWeaknesses = Object.values(heroData).filter(
      (cd) => cd.subTypeCode === "basicweakness"
    );
    const randomBasicWeakness =
      basicWeaknesses[Math.floor(Math.random() * basicWeaknesses.length)];
    newSlots[randomBasicWeakness.code] = 1;
  }

  return {
    name: data.name,
    investigator_code: data.investigator_code,
    slots: newSlots,
  };
};
