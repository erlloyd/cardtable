import { Action, createAsyncThunk, ThunkAction } from "@reduxjs/toolkit";
import axios from "axios";
import { Vector2d } from "konva/lib/types";
import { v4 as uuidv4, v4 } from "uuid";
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
  addCardStackToPlayerBoardWithId,
  AddCardStackToPlayerBoardWithIdPayload,
  addCardStackWithSnapAndId,
  // createDeckFromTextFileWithIds,
  drawCardsOutOfCardStackWithIds,
  pullCardOutOfCardStackWithId,
  replaceCardStack,
  setStackShuffling,
  startCardMoveWithSplitStackId,
} from "./cards.actions";
import { getCards, getPlayerCardsForPlayerNumber } from "./cards.selectors";
import {
  addToPlayerHand,
  adjustCounterTokenWithMax,
  cardFromHandMoveWithSnap,
  cardMoveWithSnap,
  endCardMoveWithSnap,
} from "./cards.slice";
import {
  CardtableJSONDeck,
  ICardDetails,
  ICardStack,
  IPlayerBoardSlotLocation,
} from "./initialState";
import log from "loglevel";
import { sendNotification } from "../notifications/notifications.slice";
import { GameModule, ILoadedDeck } from "../../game-modules/GameModule";
import GameManager from "../../game-modules/GameModuleManager";
import { GameType } from "../../game-modules/GameType";
import {
  CardSizeType,
  CounterTokenType,
  stackShuffleAnimationMS,
} from "../../constants/card-constants";

interface AddCardStackPayload {
  cardJsonIds: string[];
  position: Vector2d;
  faceup?: boolean;
}

interface AddCardStackToPlayerBoardLocationPayload {
  cardJsonIds: string[];
  slot: IPlayerBoardSlotLocation;
  faceup?: boolean;
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
  (
    pos: Vector2d,
    sizeType: CardSizeType
  ): ThunkAction<void, RootState, unknown, Action<string>> =>
  (dispatch, getState) => {
    const snap = getSnapCardsToGrid(getState());
    dispatch(cardFromHandMoveWithSnap({ ...pos, sizeType, snap }));
  };

export const cardMove =
  (info: {
    id: string;
    dx: number;
    dy: number;
  }): ThunkAction<void, RootState, unknown, Action<string>> =>
  (dispatch, getState) => {
    const snap = getSnapCardsToGrid(getState());
    const currentGameType =
      getActiveGameType(getState()) ?? GameType.MarvelChampions;
    const attachLocation =
      GameManager.properties[currentGameType].defaultAttachLocation;
    dispatch(cardMoveWithSnap({ ...info, snap, attachLocation }));
  };

export const endCardMove =
  (id: string): ThunkAction<void, RootState, unknown, Action<string>> =>
  (dispatch, getState) => {
    const snap = getSnapCardsToGrid(getState());
    const currentGameType =
      getActiveGameType(getState()) ?? GameType.MarvelChampions;
    const attachLocation =
      GameManager.properties[currentGameType].defaultAttachLocation;
    dispatch(endCardMoveWithSnap({ id, snap, attachLocation }));
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
        // We have to do a setTimeout here, because if we do it in this event loop,
        // the overall change for this card is nothing for the shuffling param
        setTimeout(() => {
          dispatch(
            setStackShuffling({ id: stackToShuffle.id, shuffling: false })
          );
          dispatch(
            replaceCardStack({ id: stackToShuffle.id, newStack: shuffledStack })
          );
        }, stackShuffleAnimationMS);
      });
  };

export const addCardStack =
  (
    payload: AddCardStackPayload
  ): ThunkAction<void, RootState, unknown, Action<string>> =>
  (dispatch, getState) => {
    const snap = getSnapCardsToGrid(getState());

    const cardsData = getCardsDataEntities(getState());

    // For now, use the top card to determine what size it should be

    const topCard =
      payload.cardJsonIds && payload.cardJsonIds.length > 0
        ? cardsData[payload.cardJsonIds[0]]
        : null;

    const sizeType = topCard?.extraInfo.sizeType ?? CardSizeType.Standard;

    const payloadWithId = {
      ...payload,
      snap,
      id: uuidv4(),
      sizeType,
    };
    dispatch(addCardStackWithSnapAndId(payloadWithId));
  };

export const addCardStackToPlayerBoardSlot =
  (
    payload: AddCardStackToPlayerBoardLocationPayload
  ): ThunkAction<void, RootState, unknown, Action<string>> =>
  (dispatch, getState) => {
    const cardsData = getCardsDataEntities(getState());

    // For now, use the top card to determine what size it should be

    const topCard =
      payload.cardJsonIds && payload.cardJsonIds.length > 0
        ? cardsData[payload.cardJsonIds[0]]
        : null;

    const sizeType = topCard?.extraInfo.sizeType ?? CardSizeType.Standard;

    const payloadWithId: AddCardStackToPlayerBoardWithIdPayload = {
      ...payload,
      id: uuidv4(),
      sizeType,
    };
    dispatch(addCardStackToPlayerBoardWithId(payloadWithId));
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

export const addToPlayerHandWithRoleCheck =
  (payload: {
    playerNumber: number;
  }): ThunkAction<void, RootState, unknown, Action<string>> =>
  (dispatch, getState) => {
    // Check first to see if there is a role required
    if (failRoleCheck(getState())) {
      dispatch(
        sendNotification({
          id: uuidv4(),
          level: "error",
          message: "This game requires you to select a role before playing.",
        })
      );
      return;
    }

    dispatch(addToPlayerHand(payload));
    return;
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

    if (failRoleCheck(getState())) {
      dispatch(
        sendNotification({
          id: uuidv4(),
          level: "error",
          message: "This game requires you to select a role before playing.",
        })
      );
      return;
    }

    const payloadWithIds = {
      ...payload,
      idsToUse: possibleIds,
      drawIntoHand: drawCardsIntoHand,
      playerNumber: playerNumberToUse,
    };
    dispatch(drawCardsOutOfCardStackWithIds(payloadWithIds));
  };

export const adjustCounterToken =
  (payload: {
    id?: string;
    tokenType: CounterTokenType;
    delta?: number;
    value?: number;
  }): ThunkAction<void, RootState, unknown, Action<string>> =>
  (dispatch, getState) => {
    const currentGameType = getActiveGameType(getState());
    let isSingle = false;
    switch (payload.tokenType) {
      case CounterTokenType.Damage:
        isSingle = !!GameManager.getModuleForType(
          currentGameType ?? GameType.MarvelChampions
        ).properties.tokens.damage?.singleOnly;
        break;
      case CounterTokenType.Threat:
        isSingle = !!GameManager.getModuleForType(
          currentGameType ?? GameType.MarvelChampions
        ).properties.tokens.threat?.singleOnly;
        break;
      case CounterTokenType.Generic:
        isSingle = !!GameManager.getModuleForType(
          currentGameType ?? GameType.MarvelChampions
        ).properties.tokens.generic?.singleOnly;
        break;
      case CounterTokenType.Acceleration:
        isSingle = !!GameManager.getModuleForType(
          currentGameType ?? GameType.MarvelChampions
        ).properties.tokens.acceleration?.singleOnly;
        break;
    }

    dispatch(
      adjustCounterTokenWithMax({ ...payload, max: isSingle ? 1 : undefined })
    );
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
  (dispatch, getState) => {
    const currentGameType = getActiveGameType(getState());

    try {
      const deckContents = JSON.parse(
        payload.jsonContents
      ) as CardtableJSONDeck;
      if (deckContents.gameTypeForDeck !== currentGameType) {
        dispatch(
          sendNotification({
            id: v4(),
            level: "error",
            message: "This deck is for a different game",
          })
        );
      } else {
        // create the deck
        dispatch(
          addCardStack({
            position: payload.position,
            cardJsonIds: deckContents.cardsInStack,
          })
        );
      }
    } catch (e) {
      dispatch(
        sendNotification({
          id: v4(),
          level: "error",
          message: "Could not load deck from json",
        })
      );
    }
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
      if (
        !!GameManager.getModuleForType(payload.gameType).loadDecklistFromAPI
      ) {
        response = await GameManager.getModuleForType(payload.gameType)
          .loadDecklistFromAPI!!(payload.decklistId);
      } else {
        response = await axios.get(`${apiUrl}${payload.decklistId}`);
      }
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

const failRoleCheck = (state: RootState) => {
  const currentGameType = getActiveGameType(state);
  const playerNumberToUse =
    getGame(state).currentVisiblePlayerHandNumber ??
    getGame(state).playerNumbers[myPeerRef];
  const playerHand = getPlayerCardsForPlayerNumber(playerNumberToUse)(state);
  const drawCardsIntoHand = getGame(state).drawCardsIntoHand;
  return (
    drawCardsIntoHand &&
    currentGameType &&
    GameManager.getModuleForType(currentGameType).properties.roles
      ?.requireRole &&
    !playerHand?.role
  );
};
