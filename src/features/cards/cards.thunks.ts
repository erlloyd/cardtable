import { Action, createAsyncThunk, ThunkAction } from "@reduxjs/toolkit";
import axios from "axios";
import { Vector2d } from "konva/lib/types";
import { v4 as uuidv4 } from "uuid";
import { GameType, myPeerRef } from "../../constants/app-constants";
import { EXTRA_CARDS } from "../../constants/card-pack-mapping";
import { GamePropertiesMap } from "../../constants/game-type-properties-mapping";
import { RootState } from "../../store/rootReducer";
import { cacheImages, getImgUrlsFromJsonId } from "../../utilities/card-utils";
import { convertMarvelTxtToDeckInfo } from "../../utilities/marvel-txt-converter";
import {
  getCardsDataEncounterEntities,
  getCardsDataEntities,
  getCardsDataHeroEntities,
  getCardsDataHerosByName,
  getCardsDataPlayerCardsByName,
} from "../cards-data/cards-data.selectors";
import { ICardData } from "../cards-data/initialState";
import { getGame, getSnapCardsToGrid } from "../game/game.selectors";
import {
  addCardStackWithSnapAndId,
  createDeckFromTextFileWithIds,
  drawCardsOutOfCardStackWithIds,
  pullCardOutOfCardStackWithId,
  replaceCardStack,
  setStackShuffling,
  startCardMoveWithSplitStackId,
} from "./cards.actions";
import { getCards } from "./cards.selectors";
import {
  cardFromHandMoveWithSnap,
  cardMoveWithSnap,
  endCardMoveWithSnap,
} from "./cards.slice";
import { ICardDetails, ICardStack } from "./initialState";

interface DeckData {
  investigator_code: string;
  slots: { [key: string]: number };
}

interface LOTRDeckData {
  heroes: { [key: string]: number };
  slots: { [key: string]: number };
  sideslots?: { [key: string]: number };
}

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
  facedown?: boolean;
}

export const cardFromHandMove =
  (pos: Vector2d): ThunkAction<void, RootState, unknown, Action<string>> =>
  (dispatch, getState) => {
    const snap = getSnapCardsToGrid(getState());
    dispatch(cardFromHandMoveWithSnap({ ...pos, snap }));
  };

export const cardMove =
  (info: {
    id: string;
    dx: number;
    dy: number;
  }): ThunkAction<void, RootState, unknown, Action<string>> =>
  (dispatch, getState) => {
    const snap = getSnapCardsToGrid(getState());
    dispatch(cardMoveWithSnap({ ...info, snap }));
  };

export const endCardMove =
  (id: string): ThunkAction<void, RootState, unknown, Action<string>> =>
  (dispatch, getState) => {
    const snap = getSnapCardsToGrid(getState());
    dispatch(endCardMoveWithSnap({ id, snap }));
  };

export const shuffleStack =
  (id?: string): ThunkAction<void, RootState, unknown, Action<string>> =>
  (dispatch, getState) => {
    const cardsState = getCards(getState());
    const stacksToShuffle = !!id
      ? [cardsState.cards.find((c) => c.id === id)]
      : cardsState.cards.filter(
          (c) => c.selected && c.controlledBy === myPeerRef
        );

    stacksToShuffle
      .filter((s): s is ICardStack => !!s && s.cardStack.length > 1)
      .forEach((stackToShuffle) => {
        dispatch(setStackShuffling({ id: stackToShuffle.id, shuffling: true }));
        const shuffledStack = shuffle(stackToShuffle.cardStack);
        dispatch(
          replaceCardStack({ id: stackToShuffle.id, newStack: shuffledStack })
        );

        // We have to do a setTimeout here, because if we do it in this event loop,
        // the overall change for this card is nothing for the shuffling param
        setTimeout(() => {
          dispatch(
            setStackShuffling({ id: stackToShuffle.id, shuffling: false })
          );
        });
      });
  };

export const addCardStack =
  (
    payload: AddCardStackPayload
  ): ThunkAction<void, RootState, unknown, Action<string>> =>
  (dispatch, getState) => {
    const snap = getSnapCardsToGrid(getState());
    const payloadWithId = {
      ...payload,
      snap,
      id: uuidv4(),
    };
    dispatch(addCardStackWithSnapAndId(payloadWithId));
  };

export const pullCardOutOfCardStack =
  (
    payload: PullCardOutOfCardStackPayload
  ): ThunkAction<void, RootState, unknown, Action<string>> =>
  (dispatch) => {
    const payloadWithId = {
      ...payload,
      id: uuidv4(),
    };
    dispatch(pullCardOutOfCardStackWithId(payloadWithId));
  };

export const startCardMove =
  (
    payload: StartCardMovePayload
  ): ThunkAction<void, RootState, unknown, Action<string>> =>
  (dispatch) => {
    const payloadWithId = {
      ...payload,
      splitCardId: uuidv4(),
    };
    dispatch(startCardMoveWithSplitStackId(payloadWithId));
  };

export const drawCardsOutOfCardStack =
  (
    payload: DrawCardsOutOfCardStackPayload
  ): ThunkAction<void, RootState, unknown, Action<string>> =>
  (dispatch, getState) => {
    const playerNumberToUse =
      getGame(getState()).currentVisiblePlayerHandNumber ??
      getGame(getState()).playerNumbers[myPeerRef];
    const drawCardsIntoHand = getGame(getState()).drawCardsIntoHand;
    const possibleIds = Array.from({ length: payload.numberToDraw }).map((_i) =>
      uuidv4()
    );
    const payloadWithIds = {
      ...payload,
      idsToUse: possibleIds,
      drawIntoHand: drawCardsIntoHand,
      playerNumber: playerNumberToUse,
    };
    dispatch(drawCardsOutOfCardStackWithIds(payloadWithIds));
  };

export const createDeckFromTxt =
  (payload: {
    gameType: GameType;
    position: Vector2d;
    txtContents: string;
  }): ThunkAction<void, RootState, unknown, Action<string>> =>
  (dispatch, getState) => {
    if (payload.gameType === GameType.MarvelChampions) {
      const heroCardsDataByName = getCardsDataHerosByName(getState());
      const playerCardsDataByName = getCardsDataPlayerCardsByName(getState());
      dispatch(
        createDeckFromTextFileWithIds(
          getMarvelCards(
            convertMarvelTxtToDeckInfo(
              heroCardsDataByName,
              playerCardsDataByName,
              payload.position,
              payload.txtContents
            ),
            getState(),
            {
              gameType: payload.gameType,
              decklistId: -1,
              position: payload.position,
            }
          )
        )
      );
    }
  };

export const createDeckFromJson =
  (payload: {
    gameType: GameType;
    position: Vector2d;
    jsonContents: string;
  }): ThunkAction<void, RootState, unknown, Action<string>> =>
  (dispatch, getState) => {
    if (payload.gameType === GameType.MarvelChampions) {
      // const heroCardsDataByName = getCardsDataHerosByName(getState());
      // const playerCardsDataByName = getCardsDataPlayerCardsByName(getState());
      dispatch(
        createDeckFromTextFileWithIds(
          getMarvelCards(JSON.parse(payload.jsonContents), getState(), {
            gameType: payload.gameType,
            decklistId: -1,
            position: payload.position,
          })
        )
      );
    }
  };

export const fetchDecklistById = createAsyncThunk(
  "decklist/fetchByIdStatus",
  async (
    payload: { gameType: GameType; decklistId: number; position: Vector2d },
    thunkApi
  ) => {
    const response = await axios.get(
      `${GamePropertiesMap[payload.gameType].decklistApi}${payload.decklistId}`
    );
    const state: RootState = thunkApi.getState() as RootState;

    let returnCards;
    let codes: string[] = [];

    switch (payload.gameType) {
      case GameType.MarvelChampions:
        returnCards = getMarvelCards(response, state, payload);
        codes = [returnCards.data.investigator_code];
        break;
      case GameType.LordOfTheRingsLivingCardGame:
        returnCards = getLOTRCards(response, state, payload);
        break;
    }

    // Cache the images
    codes = codes
      .concat(Object.keys(returnCards.data.slots)) // The main data decklist
      .concat(returnCards.extraHeroCards.map((hc) => hc.jsonId)) // the extra hero cards
      .concat(returnCards.relatedEncounterDeck) // Encounter Deck
      .concat(returnCards.relatedObligationDeck); // Obligation deck

    const imgUrls = codes.reduce((urls, code) => {
      const faceupCard = getImgUrlsFromJsonId(
        code,
        true,
        getCardsDataEntities(state),
        payload.gameType
      );
      const facedownCard = getImgUrlsFromJsonId(
        code,
        false,
        getCardsDataEntities(state),
        payload.gameType
      );
      return urls.concat(faceupCard, facedownCard);
    }, [] as string[]);

    const uniqueUrls = Array.from(new Set(imgUrls));

    cacheImages(uniqueUrls);

    return returnCards;
  }
);

const getMarvelCards = (
  response: { data: DeckData },
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
    data: replaceDuplicateCards(response.data, heroCardsData),
    dataId: uuidv4(),
    extraHeroCards: extraCards,
    relatedEncounterDeck: heroEncounterDeck,
    encounterDeckId: uuidv4(),
    relatedObligationDeck: heroObligationDeck,
    obligationDeckId: uuidv4(),
  };
};

const replaceDuplicateCards = (
  data: DeckData,
  heroData: ICardData
): DeckData => {
  const newSlots: { [key: string]: number } = {};
  Object.keys(data.slots).forEach((jsonId) => {
    const cardData = heroData[jsonId];
    if (cardData && cardData.duplicate_of) {
      newSlots[cardData.duplicate_of] = data.slots[jsonId];
    } else {
      newSlots[jsonId] = data.slots[jsonId];
    }
  });
  return {
    investigator_code: data.investigator_code,
    slots: newSlots,
  };
};

const getLOTRCards = (
  response: { data: LOTRDeckData },
  state: RootState,
  payload: { gameType: GameType; decklistId: number; position: Vector2d }
) => {
  const heroCardsData = getCardsDataHeroEntities(state);

  let heroStack: ICardDetails[] = [];

  Object.entries(response.data.heroes).forEach(([key, value]) => {
    const cardDetails: ICardDetails[] = Array.from(Array(value).keys()).map(
      (): ICardDetails => ({ jsonId: key })
    );
    heroStack = heroStack.concat(cardDetails);
  });

  const newSlots: { [key: string]: number } = {};

  Object.entries(response.data.slots).forEach(([key, value]) => {
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
