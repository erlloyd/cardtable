import { Action, ThunkAction } from "@reduxjs/toolkit";
import { RootState } from "../../store/rootReducer";
import {
  addRawCardsData,
  bulkLoadCardsDataForPack,
  bulkLoadCardsForEncounterSet,
} from "./cards-data.slice";
import { GameType } from "../../game-modules/GameType";
import {
  addCustomGame,
  doneLoadingJSON,
  updateActiveGameType,
} from "../game/game.slice";
import GameManager from "../../game-modules/GameModuleManager";
import Papa from "papaparse";
import { sendNotification } from "../notifications/notifications.slice";
import { v4 } from "uuid";
import { CardData } from "../../external-api/common-card-data";
import omit from "lodash.omit";
import { ICustomGame } from "../game/initialState";

export interface CustomCard {
  id: string;
  name: string;
  landscape: boolean;
  frontImageUrl: string;
  backImageUrl: string;
  set?: string;
  setType?: string;
  loadOrder?: number;
  quantity?: number;
}

export interface InputCustomCard {
  id: string;
  name: string;
  landscape: "Y" | "N" | "y" | "n" | "YES" | "NO" | "Yes" | "No" | "yes" | "no";
  frontImageUrl: string;
  backImageUrl: string;
  set?: string;
  setType?: string;
  loadOrder?: string;
  quantity?: string;
  gameImageUrl?: string;
}

export const removeCustomCards =
  (
    gameType: GameType,
    message?: string
  ): ThunkAction<void, RootState, unknown, Action<string>> =>
  async (dispatch) => {
    const currentCustomCardsString = localStorage.getItem(
      "cardtable-custom-cards"
    );

    if (!currentCustomCardsString) return;

    let currentCustomCards = JSON.parse(currentCustomCardsString);
    if (currentCustomCards[gameType]) {
      currentCustomCards = omit(currentCustomCards, gameType);
    }

    if (Object.keys(currentCustomCards).length === 0) {
      localStorage.removeItem("cardtable-custom-cards");
    } else {
      localStorage.setItem(
        "cardtable-custom-cards",
        JSON.stringify(currentCustomCards)
      );
    }

    dispatch(
      sendNotification({
        id: v4(),
        level: "info",
        message:
          message ||
          "Custom content removed. Any custom cards will not load after page is refreshed.",
      })
    );
  };

export const allCustomData =
  (gameType: GameType): ThunkAction<void, RootState, unknown, Action<string>> =>
  async (dispatch) => {
    // get any localStorage custom cards
    let existingCustomCards: {
      [key: string]: { [key: string]: { card: CardData; playerCard: boolean } };
    } | null = JSON.parse(
      localStorage.getItem("cardtable-custom-cards") ?? "{}"
    );
    if (!existingCustomCards) {
      existingCustomCards = {};
    }

    // If we have custom cards for this gametype, group into player and non-player and load
    if (existingCustomCards[gameType]) {
      const playerCards = Object.values(existingCustomCards[gameType])
        .filter((c) => c.playerCard)
        .map((c) => c.card);
      dispatch(
        addRawCardsData({
          gameType,
          cards: playerCards,
          storeAsPlayerCards: true,
        })
      );

      const nonPlayerCards = Object.values(existingCustomCards[gameType])
        .filter((c) => !c.playerCard)
        .map((c) => c.card);
      dispatch(
        addRawCardsData({
          gameType,
          cards: nonPlayerCards,
          storeAsPlayerCards: false,
        })
      );
    }
  };

export const allJsonData =
  (gameType: GameType): ThunkAction<void, RootState, unknown, Action<string>> =>
  async (dispatch) => {
    const gameModule = GameManager.getModuleForType(gameType);

    const cardsData = await gameModule.getCardsData();

    if (!!cardsData && cardsData.length > 0) {
      dispatch(bulkLoadCardsDataForPack(cardsData));
    }

    const scenarioData = await gameModule.getEncounterSetData();

    if (!!scenarioData && scenarioData.length > 0) {
      dispatch(bulkLoadCardsForEncounterSet(scenarioData));
    }

    dispatch(allCustomData(gameType));

    dispatch(doneLoadingJSON());
  };

export const parseCsvCustomCards =
  (
    gameType: GameType,
    csvString: string,
    expectNewGame: boolean
  ): ThunkAction<void, RootState, unknown, Action<string>> =>
  async (dispatch) => {
    const parsedCsv = Papa.parse(csvString, {
      header: true,
      skipEmptyLines: true,
    });

    // go through and convert to array of json
    if (parsedCsv.errors.length > 0) {
      console.error(parsedCsv.errors);
      dispatch(
        sendNotification({
          id: v4(),
          level: "error",
          message:
            "Could not load custom cards. Please make sure the file is CSV and formatted correctly",
        })
      );
      return;
    }

    // First check to see if we are opening a new game
    const firstCard = parsedCsv.data[0] as InputCustomCard;
    let newGameInfo: ICustomGame | null = null;
    if (
      firstCard.id &&
      firstCard.name &&
      !firstCard.backImageUrl &&
      !firstCard.frontImageUrl
    ) {
      // we assume this means it is for a new game.
      if (!expectNewGame) {
        // console.error(parsedCsv.errors);
        dispatch(
          sendNotification({
            id: v4(),
            level: "error",
            message:
              "This custom content appears to be for a complete game. Please quit this game and load from the main screen.",
          })
        );
        return;

        //for now, just remove this "fake" card
        // parsedCsv.data.shift();
      } else {
        newGameInfo = {
          gameType: firstCard.id,
          name: firstCard.name,
          heroImageUrl: firstCard.gameImageUrl ?? "",
        };

        gameType = newGameInfo.gameType as GameType;
        parsedCsv.data.shift();
      }
    } else if (
      !!firstCard.id &&
      !!firstCard.name &&
      firstCard.frontImageUrl &&
      firstCard.backImageUrl &&
      expectNewGame
    ) {
      dispatch(
        sendNotification({
          id: v4(),
          level: "error",
          message:
            "This custom content appears to be for an existing game. Please start a game, then import the content.",
        })
      );
    }

    const customCards = (parsedCsv.data as InputCustomCard[]).map(
      (d: InputCustomCard): CustomCard => {
        const returnObj = {
          ...d,
          landscape: (d.landscape || "no").toLocaleLowerCase().includes("y"),
          quantity: +(d.quantity || "1"),
          loadOrder: d.loadOrder ? +d.loadOrder : undefined,
        } as CustomCard;
        return returnObj;
      }
    );

    // Now convert to common card format
    const commonFormatCustomCards: CardData[] = customCards.map((c) => ({
      code: c.id,
      doubleSided: false,
      images: { front: c.frontImageUrl, back: c.backImageUrl },
      backLink: null,
      extraInfo: {
        factionCode: null,
        packCode: null,
        setCode: c.set ?? null,
        setType: c.setType ?? null,
        loadOrder: c.loadOrder,
      },
      name: c.name,
      typeCode: c.landscape ? "custom_landscape" : "custom",
      quantity: c.quantity || 1,
      octgnId: null,
      subTypeCode: null,
      customCard: true,
    }));

    const isPlayerCard = false;

    // First, we need to make sure we add the new module
    if (expectNewGame && !!newGameInfo) {
      GameManager.registerCustomModule(gameType);
      dispatch(addCustomGame(newGameInfo));
    }

    dispatch(
      addRawCardsData({
        gameType,
        cards: commonFormatCustomCards,
        storeAsPlayerCards: isPlayerCard,
      })
    );

    // Now update localstorage
    let existingCustomCards: {
      [key: string]: { [key: string]: { card: CardData; playerCard: boolean } };
    } | null = JSON.parse(
      localStorage.getItem("cardtable-custom-cards") ?? "{}"
    );
    if (!existingCustomCards) {
      existingCustomCards = {};
    }

    if (!existingCustomCards[gameType]) {
      existingCustomCards[gameType] = {};
    }

    commonFormatCustomCards.forEach((c) => {
      existingCustomCards!![gameType][c.code] = {
        card: c,
        playerCard: isPlayerCard,
      };
    });

    localStorage.setItem(
      "cardtable-custom-cards",
      JSON.stringify(existingCustomCards)
    );

    // if (expectNewGame) {
    //   dispatch(updateActiveGameType(gameType));
    // }
  };
