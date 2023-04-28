import { Action, createAsyncThunk, ThunkAction } from "@reduxjs/toolkit";
import axios from "axios";
import { Vector2d } from "konva/lib/types";
import { v4 as uuidv4 } from "uuid";
import { scrapeApi } from "../../constants/api-constants";
import { myPeerRef } from "../../constants/app-constants";
import { GamePropertiesMap } from "../../constants/game-type-properties-mapping";
import { RootState } from "../../store/rootReducer";
import { cacheImages, getImgUrlsFromJsonId } from "../../utilities/card-utils";
// import { convertMarvelTxtToDeckInfo } from "../../utilities/marvel-txt-converter";
import { getCardsDataEntities } from "../cards-data/cards-data.selectors";
import {
  getActiveGameType,
  getGame,
  getSnapCardsToGrid,
} from "../game/game.selectors";
import { OnlineDeckDataMap } from "../game/initialState";
import {
  addCardStackWithSnapAndId,
  // createDeckFromTextFileWithIds,
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
import log from "loglevel";
import { sendNotification } from "../notifications/notifications.slice";
import { GameType, ILoadedDeck } from "../../game-modules/GameModule";
import GameManager from "../../game-modules/GameModuleManager";

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
  (_dispatch, _getState) => {
    console.error(`NOT SUPPORTED`);
    // if (payload.gameType === GameType.MarvelChampions) {
    //   const heroCardsDataByName = getCardsDataHerosByName(getState());
    //   const playerCardsDataByName = getCardsDataPlayerCardsByName(getState());
    //   dispatch(
    //     createDeckFromTextFileWithIds(
    //       getMarvelCards(
    //         convertMarvelTxtToDeckInfo(
    //           heroCardsDataByName,
    //           playerCardsDataByName,
    //           payload.position,
    //           payload.txtContents
    //         ),
    //         getState(),
    //         {
    //           gameType: payload.gameType,
    //           decklistId: -1,
    //           position: payload.position,
    //         }
    //       )
    //     )
    //   );
    // }
  };

export const createDeckFromJson =
  (payload: {
    gameType: GameType;
    position: Vector2d;
    jsonContents: string;
  }): ThunkAction<void, RootState, unknown, Action<string>> =>
  (_dispatch, _getState) => {
    console.error(`NOT SUPPORTED`);
    // if (payload.gameType === GameType.MarvelChampions) {
    //   // const heroCardsDataByName = getCardsDataHerosByName(getState());
    //   // const playerCardsDataByName = getCardsDataPlayerCardsByName(getState());
    //   dispatch(
    //     createDeckFromTextFileWithIds(
    //       getMarvelCards(JSON.parse(payload.jsonContents), getState(), {
    //         gameType: payload.gameType,
    //         decklistId: -1,
    //         position: payload.position,
    //       })
    //     )
    //   );
    // }
  };

export const getListOfDecklistsFromSearchTerm = createAsyncThunk(
  "decklist/getListOfDecklistFromSearchTermStatus",
  async (
    payload: {
      decklistSearchTerm: string;
      position: Vector2d;
    },
    thunkApi
  ) => {
    const gameType = getActiveGameType(thunkApi.getState() as RootState);
    if (!!gameType) {
      const uriToScrape = `${
        GamePropertiesMap[gameType].decklistSearchApi
      }?name=${encodeURIComponent(payload.decklistSearchTerm)}&${
        GamePropertiesMap[gameType].decklistSearchApiConstants ?? ""
      }`;
      const response = await axios.get<{
        StatusCode: number;
        Decks: OnlineDeckDataMap;
      }>(`${scrapeApi}?uri=${encodeURIComponent(uriToScrape)}`);

      if (response.data.StatusCode !== 200) {
        log.error(`Scraper couldn't get the data. Check scraper logs`);
        throw new Error(`Scraper couldn't get the data. Check scraper logs`);
      }

      return response.data.Decks;
    }
  }
);

export const fetchDecklistById = createAsyncThunk(
  "decklist/fetchByIdStatus",
  async (
    payload: {
      gameType: GameType;
      decklistId: number;
      usePrivateApi: boolean;
      position: Vector2d;
    },
    thunkApi
  ) => {
    let response;
    const privateApiUrl =
      GamePropertiesMap[payload.gameType].privateDecklistApi;
    const publicApiUrl = GamePropertiesMap[payload.gameType].decklistApi;
    // if usePrivateApi is true and the game has a private decklist endpoint available, use it. Otherwise use public
    const apiUrl =
      payload.usePrivateApi && privateApiUrl ? privateApiUrl : publicApiUrl;
    try {
      response = await axios.get(`${apiUrl}${payload.decklistId}`);
    } catch (e) {
      let errorMessage = `Couldn't load deck ${payload.decklistId}. `;
      if (privateApiUrl) {
        if (payload.usePrivateApi) {
          errorMessage +=
            ' Ensure the id is correct and not a public deck id, and that "Share your decks" is checked in the user\'s settings.';
        } else {
          errorMessage +=
            'Ensure the id is correct and not a private deck. If it is private, check the use the "private deck" option';
        }
      } else {
        errorMessage +=
          "Ensure the id is correct and not a private deck. This game can only support public decks at this time.";
      }
      thunkApi.dispatch(
        sendNotification({
          id: uuidv4(),
          level: "error",
          message: errorMessage,
        })
      );
      throw e;
    }

    if (!response) throw new Error("Empty response");

    const state: RootState = thunkApi.getState() as RootState;

    let codes: string[] = [];
    let returnCards: ILoadedDeck | null = null;

    try {
      [codes, returnCards] = GameManager.getModuleForType(
        payload.gameType
      ).parseDecklist(response, state, payload);
    } catch (e) {
      log.error(`Error loading cards ${e}`);
      throw e;
    }

    if (returnCards === null) {
      throw new Error(`returnCards was null`);
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
