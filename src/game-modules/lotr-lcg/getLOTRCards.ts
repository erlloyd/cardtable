import { Vector2d } from "konva/lib/types";
import { RootState } from "../../store/rootReducer";
import { GameType } from "../GameType";
import { getCardsDataHeroEntities } from "../../features/cards-data/cards-data.selectors";
import { ICardDetails } from "../../features/cards/initialState";
import { fixCardCode } from "../common-utils";
import { v4 as uuidv4 } from "uuid";

export interface LOTRDeckData {
  heroes: { [key: string]: number };
  slots: { [key: string]: number };
  sideslots?: { [key: string]: number };
}

export const getLOTRCards = (
  response: { data: LOTRDeckData },
  state: RootState,
  payload: { gameType: GameType; decklistId: number; position: Vector2d }
) => {
  const heroCardsData = getCardsDataHeroEntities(state);

  let heroStack: ICardDetails[] = [];

  Object.entries(response.data.heroes).forEach(([key, value]) => {
    key = fixCardCode(key);
    const cardDetails: ICardDetails[] = Array.from(Array(value).keys()).map(
      (): ICardDetails => ({ jsonId: key })
    );
    heroStack = heroStack.concat(cardDetails);
  });

  const newSlots: { [key: string]: number } = {};

  Object.entries(response.data.slots).forEach(([key, value]) => {
    key = fixCardCode(key);
    //get the card data to make sure it's not a hero
    const cardData = heroCardsData[key];
    if (!cardData) {
      throw new Error(`Couldn't find card data for ${key}`);
    }

    if (cardData.typeCode !== "Hero") {
      newSlots[key] = value as number;
    }
  });

  let sideboardStack: string[] = [];

  Object.entries(response.data.sideslots ?? []).forEach(([key, value]) => {
    key = fixCardCode(key);
    const cardData = heroCardsData[key];
    if (!cardData) {
      throw new Error(`Couldn't find card data for sideboard card ${key}`);
    }

    if (cardData.typeCode !== "Hero") {
      const cardDetails: string[] = Array.from(Array(value).keys()).map(
        (): string => key
      );
      sideboardStack = sideboardStack.concat(cardDetails);
    }
  });

  response.data.slots = newSlots;

  return {
    position: payload.position,
    heroId: uuidv4(),
    data: response.data,
    dataId: uuidv4(),
    extraHeroCards: heroStack,
    relatedEncounterDeck: sideboardStack,
    encounterDeckId: uuidv4(),
    relatedObligationDeck: [],
    obligationDeckId: uuidv4(),
  };
};
