import { Action, createAsyncThunk, ThunkAction } from "@reduxjs/toolkit";
import axios from "axios";
import { Vector2d } from "konva/types/types";
import { RootState } from "../../store/rootReducer";
import {
  getCardsDataEncounterEntities,
  getCardsDataHeroEntities,
} from "../cards-data/cards-data.selectors";
import { v4 as uuidv4 } from "uuid";
import {
  addCardStackWithId,
  drawCardsOutOfCardStackWithIds,
  pullCardOutOfCardStackWithId,
  replaceCardStack,
  startCardMoveWithSplitStackId,
} from "./cards.actions";
import { ICardDetails } from "./initialState";
import { getCards } from "./cards.selectors";
import { EXTRA_CARDS } from "../../constants/card-pack-mapping";

interface AddCardStackPayload {
  cardJsonIds: string[];
  position: Vector2d;
}

export interface PullCardOutOfCardStackPayload {
  cardStackId: string;
  jsonId: string;
  pos: Vector2d;
}

export interface StartCardMovePayload {
  id: string;
  splitTopCard: boolean;
}

export interface DrawCardsOutOfCardStackPayload {
  cardStackId: string;
  numberToDraw: number;
}

export const shuffleStack = (
  id: string
): ThunkAction<void, RootState, unknown, Action<string>> => (
  dispatch,
  getState
) => {
  const cardsState = getCards(getState());
  const stackToShuffle = cardsState.cards.find((c) => c.id === id);
  if (!!stackToShuffle) {
    const shuffledStack = shuffle(stackToShuffle.cardStack);
    dispatch(replaceCardStack({ id, newStack: shuffledStack }));
  }
};

export const addCardStack = (
  payload: AddCardStackPayload
): ThunkAction<void, RootState, unknown, Action<string>> => (dispatch) => {
  const payloadWithId = {
    ...payload,
    id: uuidv4(),
  };
  dispatch(addCardStackWithId(payloadWithId));
};

export const pullCardOutOfCardStack = (
  payload: PullCardOutOfCardStackPayload
): ThunkAction<void, RootState, unknown, Action<string>> => (dispatch) => {
  const payloadWithId = {
    ...payload,
    id: uuidv4(),
  };
  dispatch(pullCardOutOfCardStackWithId(payloadWithId));
};

export const startCardMove = (
  payload: StartCardMovePayload
): ThunkAction<void, RootState, unknown, Action<string>> => (dispatch) => {
  const payloadWithId = {
    ...payload,
    splitCardId: uuidv4(),
  };
  dispatch(startCardMoveWithSplitStackId(payloadWithId));
};

export const drawCardsOutOfCardStack = (
  payload: DrawCardsOutOfCardStackPayload
): ThunkAction<void, RootState, unknown, Action<string>> => (dispatch) => {
  const possibleIds = Array.from({ length: payload.numberToDraw }).map((_i) =>
    uuidv4()
  );
  const payloadWithIds = {
    ...payload,
    idsToUse: possibleIds,
  };
  dispatch(drawCardsOutOfCardStackWithIds(payloadWithIds));
};

export const fetchDecklistById = createAsyncThunk(
  "decklist/fetchByIdStatus",
  async (payload: { decklistId: number; position: Vector2d }, thunkApi) => {
    const response = await axios.get(
      `https://marvelcdb.com/api/public/decklist/${payload.decklistId}`
    );
    const state: RootState = thunkApi.getState() as RootState;
    const heroCardsData = getCardsDataHeroEntities(state);
    const heroSet = heroCardsData[response.data.investigator_code];
    const heroSetCode = heroSet.set_code;
    const encounterCardsData = getCardsDataEncounterEntities(state);

    const heroObligationDeck = Object.entries(encounterCardsData)
      .filter(
        ([_key, value]) =>
          value.set_code === `${heroSetCode}` &&
          value.type_code === "obligation"
      )
      .map(([key, _value]) => key);

    // get the encounter cards for this deck
    const heroEncounterDeckData = Object.values(encounterCardsData).filter(
      (value) => value.set_code === `${heroSetCode}_nemesis`
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
      data: response.data,
      dataId: uuidv4(),
      extraHeroCards: extraCards,
      relatedEncounterDeck: heroEncounterDeck,
      encounterDeckId: uuidv4(),
      relatedObligationDeck: heroObligationDeck,
      obligationDeckId: uuidv4(),
    };
  }
);

const shuffle = (array: ICardDetails[]): ICardDetails[] => {
  const returnArray = JSON.parse(JSON.stringify(array));
  var currentIndex = returnArray.length,
    temporaryValue,
    randomIndex;

  // While there remain elements to shuffle...
  while (0 !== currentIndex) {
    // Pick a remaining element...
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex -= 1;

    // And swap it with the current element.
    temporaryValue = returnArray[currentIndex];
    returnArray[currentIndex] = returnArray[randomIndex];
    returnArray[randomIndex] = temporaryValue;
  }

  return returnArray;
};
