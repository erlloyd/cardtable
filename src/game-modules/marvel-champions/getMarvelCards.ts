import { Vector2d } from "konva/lib/types";
import { RootState } from "../../store/rootReducer";
import { GameType } from "../GameModule";
import {
  getCardsDataEncounterEntities,
  getCardsDataHeroEntities,
} from "../../features/cards-data/cards-data.selectors";
import { v4 as uuidv4 } from "uuid";
import { ICardData } from "../../features/cards-data/initialState";
import { fixCardCode } from "../common-utils";
import { ICardDetails } from "../../features/cards/initialState";
import { EXTRA_CARDS } from "./extraCards";

export interface MarvelDeckData {
  investigator_code: string;
  slots: { [key: string]: number };
}

export const getMarvelCards = (
  response: { data: MarvelDeckData },
  state: RootState,
  payload: { gameType: GameType; decklistId: number; position: Vector2d }
) => {
  const heroCardsData = getCardsDataHeroEntities(state);
  const heroSet = heroCardsData[response.data.investigator_code];
  const heroSetCode = heroSet.extraInfo.setCode;
  const encounterCardsData = getCardsDataEncounterEntities(state);

  let heroObligationDeck: string[] = [];
  Object.entries(encounterCardsData)
    .filter(
      ([_key, value]) =>
        (value.extraInfo.setCode === `${heroSetCode}` ||
          value.extraInfo.setCode === `${heroSetCode}_nemesis` ||
          value.extraInfo.setCode ===
            `${heroSetCode?.replace("_hero", "")}_nemesis`) &&
        value.typeCode === "obligation"
    )
    .forEach(([key, value]) => {
      heroObligationDeck = heroObligationDeck.concat(
        Array.from({ length: value.quantity }).map((_i) => key)
      );
    });

  // get the encounter cards for this deck
  const heroEncounterDeckData = Object.values(encounterCardsData).filter(
    (value) =>
      (value.extraInfo.setCode === `${heroSetCode}_nemesis` ||
        value.extraInfo.setCode ===
          `${heroSetCode?.replace("_hero", "")}_nemesis`) &&
      value.typeCode !== "obligation"
  );

  let heroEncounterDeck: string[] = [];
  heroEncounterDeckData.forEach((cd) => {
    heroEncounterDeck = heroEncounterDeck.concat(
      Array.from({ length: cd.quantity }).map((_i) => cd.code)
    );
  });

  // check to see if there are any special extra cards for this hero
  const extraCards = EXTRA_CARDS[heroSetCode ?? ""] ?? [];

  // response.data.slots = { ...extraCards, ...response.data.slots };

  return {
    position: payload.position,
    heroId: uuidv4(),
    data: fixSlotsCardCodes(
      replaceDuplicateCards(response.data, heroCardsData)
    ),
    dataId: uuidv4(),
    extraHeroCards: fixCardDetailsCardCodes(extraCards),
    relatedEncounterDeck: fixCodeList(heroEncounterDeck),
    encounterDeckId: uuidv4(),
    relatedObligationDeck: fixCodeList(heroObligationDeck),
    obligationDeckId: uuidv4(),
  };
};

const fixCodeList = (list: string[]) => list.map((l) => fixCardCode(l));

const fixCardDetailsCardCodes = (details: ICardDetails[]): ICardDetails[] =>
  details.map((d) => ({ jsonId: fixCardCode(d.jsonId) }));

const fixSlotsCardCodes = (data: MarvelDeckData): MarvelDeckData => {
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

const replaceDuplicateCards = (
  data: MarvelDeckData,
  heroData: ICardData
): MarvelDeckData => {
  const newSlots: { [key: string]: number } = {};
  Object.keys(data.slots).forEach((jsonId) => {
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
  return {
    investigator_code: data.investigator_code,
    slots: newSlots,
  };
};
