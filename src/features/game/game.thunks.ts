import { Action, ThunkAction } from "@reduxjs/toolkit";
import { saveAs } from "file-saver";
import JSONCrush from "jsoncrush";
import cloneDeep from "lodash.clonedeep";
import omit from "lodash.omit";
import { v4 as uuidv4 } from "uuid";
import { GameType } from "../../game-modules/GameType";
import { receiveRemoteGameState } from "../../store/global.actions";
import { RootState } from "../../store/rootReducer";
import { copyToClipboard, getBaseUrl } from "../../utilities/text-utils";
import { CardtableJSONDeck, ICardStack } from "../cards/initialState";
import { sendNotification } from "../notifications/notifications.slice";
import { getActiveGameType } from "./game.selectors";

export const generateGameStateSave =
  (): ThunkAction<void, RootState, unknown, Action<any>> =>
  (_dispatch, getState) => {
    const state = getState();

    const stateToSave = cloneDeep(omit(state, ["cardsData"]));

    // sanitize a bit
    // We don't need to persist ghost cards
    stateToSave.liveState.present.cards.ghostCards = [];
    stateToSave.liveState.present.cards.cards =
      stateToSave.liveState.present.cards.cards.map((c) => ({
        ...c,
        controlledBy: "",
        selected: false,
      }));

    var blob = new Blob([JSON.stringify(stateToSave)], {
      type: "text/plain;charset=utf-8",
    });
    saveAs(
      blob,
      `${getActiveGameType(state)}-${new Date().toISOString()}.cardtable`
    );
  };

export const loadGameStateFromSave =
  (jsonString: string): ThunkAction<void, RootState, unknown, Action<any>> =>
  (dispatch, getState) => {
    // First, try to parse and make sure it is JSON
    let gameJSON = {} as RootState;
    try {
      gameJSON = JSON.parse(jsonString);
    } catch (e) {
      dispatch(
        sendNotification({
          id: uuidv4(),
          level: "error",
          message: "The game file you tried to load appears to be invalid.",
        })
      );
      return;
    }

    // Next, make sure that the game type matches the one we're currently in
    const currentGameType = getActiveGameType(getState());

    if (gameJSON.game?.activeGameType != currentGameType) {
      dispatch(
        sendNotification({
          id: uuidv4(),
          level: "error",
          message: "The game file you tried to load is for a different game.",
        })
      );
      return;
    }

    // Sanitize the card data
    gameJSON.liveState.present.cards.ghostCards = [];
    gameJSON.liveState.present.cards.cards =
      gameJSON.liveState.present.cards.cards.map((c) => ({
        ...c,
        controlledBy: "",
        selected: false,
      }));

    // Load the game
    dispatch(receiveRemoteGameState(gameJSON));
  };

export const generateGameStateUrl =
  (): ThunkAction<void, RootState, unknown, Action<any>> =>
  (_dispatch, getState) => {
    const currentStoreState = getState();

    const cards = currentStoreState.liveState.present.cards.cards;
    const counters = currentStoreState.liveState.present.counters;
    const playerHands = currentStoreState.liveState.present.cards.playerHands;
    const arrows = currentStoreState.liveState.present.arrows;
    const notes = currentStoreState.liveState.present.notes;
    const gameType = currentStoreState.game.activeGameType;
    const crushedCardsString = JSONCrush.crush(JSON.stringify(cards));
    const crushedCountersString = JSONCrush.crush(JSON.stringify(counters));
    const crushedPlayerHandString = JSONCrush.crush(
      JSON.stringify(playerHands)
    );
    const crushedArrowsString = JSONCrush.crush(JSON.stringify(arrows));
    const crushedNotesString = JSONCrush.crush(JSON.stringify(notes));
    copyToClipboard(
      `${getBaseUrl()}?gameType=${gameType}&cards=${encodeURIComponent(
        crushedCardsString
      )}&counters=${encodeURIComponent(
        crushedCountersString
      )}&hands=${encodeURIComponent(
        crushedPlayerHandString
      )}&arrows=${encodeURIComponent(
        crushedArrowsString
      )}&notes=${encodeURIComponent(crushedNotesString)}`
    );
  };

export const clearQueryParams =
  (): ThunkAction<void, RootState, unknown, Action<any>> => () => {
    const queryParams = new URLSearchParams(window.location.search);
    const queryParamsGameType = queryParams.get("gameType");
    if (!!queryParamsGameType) {
      window.history.replaceState(
        {},
        document.title,
        window.location.pathname || "/"
      );
    }
  };

export const saveDeckAsJson =
  (
    cardStack: ICardStack | undefined,
    currentGameType: GameType
  ): ThunkAction<void, RootState, unknown, Action<any>> =>
  () => {
    if (!cardStack || cardStack.cardStack.length < 1) return;

    const topCard = cardStack.cardStack[0];

    // convert to an object
    const cardTableDeck: CardtableJSONDeck = {
      gameTypeForDeck: currentGameType,
      cardsInStack: cardStack.cardStack.map((c) => c.jsonId),
    };

    let filename = `${topCard.jsonId}_deck.json`;
    let contentType = "application/json;charset=utf-8;";

    var a = document.createElement("a");
    a.style.display = "none";
    a.download = filename;
    a.href =
      "data:" +
      contentType +
      "," +
      encodeURIComponent(JSON.stringify(cardTableDeck, null, 2));
    a.target = "_blank";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };
