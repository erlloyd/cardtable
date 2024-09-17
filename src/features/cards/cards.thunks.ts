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
import log from "loglevel";
import {
  cardConstants,
  CardSizeType,
  stackShuffleAnimationMS,
} from "../../constants/card-constants";
import {
  ILoadedDeck,
  ILoadedDeckMetadata,
} from "../../game-modules/GameModule";
import GameManager from "../../game-modules/GameModuleManager";
import { GameType } from "../../game-modules/GameType";
import { getCardsDataEntities } from "../cards-data/cards-data.selectors";
import { createNewTokens } from "../counters/counters.slice";
import {
  getActiveGameType,
  getGame,
  getRecentlyLoadedDecksForGameType,
  getSnapCardsToGrid,
} from "../game/game.selectors";
import { storeRecentlyLoadedDeck } from "../game/game.slice";
import { IRecentlyLoadedDeck, OnlineDeckDataMap } from "../game/initialState";
import { sendNotification } from "../notifications/notifications.slice";
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
import {
  cardsSelectedWithPeerRef,
  getCards,
  getPlayerCardsForPlayerNumber,
} from "./cards.selectors";
import {
  addToPlayerHand,
  adjustCounterTokenWithMax,
  cardFromHandMoveWithSnap,
  cardMoveWithSnap,
  endCardMoveWithSnap,
  reorderTopCardsOfStack,
} from "./cards.slice";
import {
  CardtableJSONDeck,
  ICardDetails,
  ICardStack,
  IPlayerBoardSlotLocation,
} from "./initialState";

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
  forceOnTable?: boolean;
}

export const reorderAndDrawCardsFromTop =
  (info: {
    stackId: string;
    numCards: number;
    top: string[];
    bottom: string[];
    draw: string[];
    reveal: string[];
    randomTop: boolean;
    randomBottom: boolean;
  }): ThunkAction<void, RootState, unknown, Action<string>> =>
  (dispatch) => {
    let topToUse = info.top;
    let bottomToUse = info.bottom;

    if (topToUse.length > 0 && info.randomTop) {
      topToUse = shuffle<string>(info.top);
    }

    if (bottomToUse.length > 0 && info.randomBottom) {
      bottomToUse = shuffle<string>(info.bottom);
    }

    dispatch(
      reorderTopCardsOfStack({ ...info, top: topToUse, bottom: bottomToUse })
    );

    if (info.draw.length > 0) {
      dispatch(
        drawCardsOutOfCardStack({
          cardStackId: info.stackId,
          numberToDraw: info.draw.length,
        })
      );
    }

    if (info.reveal.length > 0) {
      dispatch(
        drawCardsOutOfCardStack({
          cardStackId: info.stackId,
          numberToDraw: info.reveal.length,
          facedown: false,
          forceOnTable: true,
        })
      );
    }
  };

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
    abs_x?: number;
    dy: number;
    abs_y?: number;
  }): ThunkAction<void, RootState, unknown, Action<string>> =>
  (dispatch, getState) => {
    const snap = getSnapCardsToGrid(getState());
    const currentGameType =
      getActiveGameType(getState()) ?? GameType.MarvelChampions;
    const attachLocation =
      GameManager.properties[currentGameType].defaultAttachLocation;

    // get all of the selected cards for the person that are dragging
    // so we can calculate their new positions.
    const myDraggingCards = cardsSelectedWithPeerRef(myPeerRef)(
      getState()
    ).filter((c) => c.dragging);

    // for each of the cards, apply the dx / dy
    const absPosMap = {} as { [key: string]: Vector2d };

    myDraggingCards.forEach((c) => {
      absPosMap[c.id] = { x: c.x + info.dx, y: c.y + info.dy };
    });

    //Now overwirte this card in the map with the abs pos
    if (info.abs_x !== undefined && info.abs_y !== undefined) {
      absPosMap[info.id] = { x: info.abs_x, y: info.abs_y };
    }

    dispatch(cardMoveWithSnap({ ...info, snap, attachLocation, absPosMap }));
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
        const shuffledStack = shuffle<ICardDetails>(stackToShuffle.cardStack);
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
    const drawCardsIntoHand =
      !payload.forceOnTable && getGame(getState()).drawCardsIntoHand;
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
    tokenType: string;
    delta?: number;
    value?: number;
  }): ThunkAction<void, RootState, unknown, Action<string>> =>
  (dispatch, getState) => {
    const currentGameType = getActiveGameType(getState());
    let isSingle = false;

    // get the token info
    const info = GameManager.getModuleForType(
      currentGameType ?? GameType.MarvelChampions
    ).properties.counterTokens.find((ct) => ct.type === payload.tokenType);

    isSingle = !!info && !!info.singleOnly;

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
        // Handle legacy case
        if (deckContents.cardsInStack) {
          dispatch(
            addCardStack({
              position: payload.position,
              cardJsonIds: deckContents.cardsInStack,
            })
          );
        } else if (deckContents.stacks) {
          deckContents.stacks.forEach((s, index) => {
            dispatch(
              addCardStack({
                position: {
                  x:
                    payload.position.x +
                    cardConstants[CardSizeType.Standard].GRID_SNAP_WIDTH *
                      index,
                  y: payload.position.y,
                },
                cardJsonIds: s,
              })
            );
          });
        } else {
          throw new Error("Deck file is not formatted correctly");
        }
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

export const fetchRecentDeck =
  (options: {
    recentDeck: IRecentlyLoadedDeck;
    newLoadPos: Vector2d;
  }): ThunkAction<void, RootState, unknown, Action<string>> =>
  (dispatch) => {
    const payload = JSON.parse(options.recentDeck.data);
    switch (options.recentDeck.type) {
      case "by-id":
        dispatch(
          fetchDecklistById({
            ...payload,
            position: options.newLoadPos,
            fallbackResponse: options.recentDeck.rawPayloadFallback,
          })
        );
        break;
      case "by-text":
        dispatch(
          fetchDecklistByText({
            ...payload,
            position: options.newLoadPos,
            fallbackResponse: options.recentDeck.rawPayloadFallback,
          })
        );
        break;
      default:
    }
  };

export const fetchDecklistByText =
  (payload: {
    gameType: GameType;
    position: Vector2d;
    text: string;
    fallbackResponse?: { data: any };
  }): ThunkAction<void, RootState, unknown, Action<string>> =>
  (dispatch, getState) => {
    if (
      payload.gameType &&
      !!GameManager.getModuleForType(payload.gameType).loadDeckFromText
    ) {
      let metadataFromLoad: ILoadedDeckMetadata | null = null;
      try {
        const [cardStacks, metadata] = GameManager.getModuleForType(
          payload.gameType
        ).loadDeckFromText!(payload.text);

        metadataFromLoad = metadata;

        let startPosition = payload.position || { x: 100, y: 100 };

        cardStacks.forEach((cardStack, index) => {
          if (cardStack.length > 0) {
            // TODO: Support other sizes other than standard cards
            dispatch(
              addCardStack({
                cardJsonIds: cardStack,
                position: {
                  x:
                    startPosition.x +
                    cardConstants[CardSizeType.Standard].GRID_SNAP_WIDTH *
                      index,
                  y: startPosition.y,
                },
              })
            );
          }
        });
      } catch (e) {
        // Something went wrong, show an error
        dispatch(
          sendNotification({
            id: v4(),
            level: "error",
            message:
              "Could not load deck from the text provided. Check to make sure you copied the entire deck code",
          })
        );
        return;
      }

      // If we got here, store as recently loaded
      const currentRecentDecks = getRecentlyLoadedDecksForGameType(
        payload.gameType
      )(getState() as RootState);
      // If we got here (and we weren't doing a recent deck), let's store the deck in recently loaded

      const potentialDisplayName = metadataFromLoad?.displayName ?? "";

      if (
        !payload.fallbackResponse &&
        !!potentialDisplayName &&
        !currentRecentDecks.find(
          (rd) => rd.displayName === potentialDisplayName
        )
      ) {
        dispatch(
          storeRecentlyLoadedDeck({
            displayName: potentialDisplayName,
            data: JSON.stringify(payload),
            type: "by-text",
            rawPayloadFallback: undefined,
          })
        );
      }
    }
  };

export const fetchDecklistById = createAsyncThunk(
  "decklist/fetchByIdStatus",
  async (
    payload: {
      gameType: GameType;
      decklistId: number;
      usePrivateApi: boolean;
      position: Vector2d;
      fallbackResponse?: { data: any };
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
      // If we failed, but we have a fallbackResponse (generally because this deck was loaded previously) then use that

      if (!payload.fallbackResponse) {
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
      } else {
        response = payload.fallbackResponse;
      }
    }

    if (!response) throw new Error("Empty response");

    const state: RootState = thunkApi.getState() as RootState;

    let codes: string[] = [];
    let returnCards: ILoadedDeck | null = null;
    let metadata: ILoadedDeckMetadata | null = null;

    try {
      [codes, returnCards, metadata] = GameManager.getModuleForType(
        payload.gameType
      ).parseDecklist(response, state, payload);
    } catch (e) {
      log.error(`Error loading cards ${e}`);
      throw e;
    }

    if (returnCards === null) {
      throw new Error(`returnCards was null`);
    }

    const currentRecentDecks = getRecentlyLoadedDecksForGameType(
      payload.gameType
    )(thunkApi.getState() as RootState);
    // If we got here (and we weren't doing a recent deck), let's store the deck in recently loaded

    const potentialDisplayName =
      metadata?.displayName ?? `${payload.decklistId}`;

    if (
      !payload.fallbackResponse &&
      !currentRecentDecks.find((rd) => rd.displayName === potentialDisplayName)
    ) {
      thunkApi.dispatch(
        storeRecentlyLoadedDeck({
          displayName: potentialDisplayName,
          data: JSON.stringify(payload),
          type: "by-id",
          rawPayloadFallback: { data: response.data },
        })
      );
    }

    // thunkApi.dispatch(
    //   sendNotification({
    //     id: uuidv4(),
    //     level: "error",
    //     message: "TEST",
    //   })
    // );

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

    // Create any tokens
    if (metadata?.relatedTokens && metadata?.relatedTokens?.length > 0) {
      // go through the tokens and set the x and y
      metadata.relatedTokens.forEach((t, index) => {
        t.position.x = payload.position.x - 200;
        t.position.y = payload.position.y - 75 * index;
      });
      thunkApi.dispatch(createNewTokens(metadata.relatedTokens));
    }

    return returnCards;
  }
);

const shuffle = <T>(array: T[]): T[] => {
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
