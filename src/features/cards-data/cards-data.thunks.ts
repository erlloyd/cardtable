import { Action, ThunkAction } from "@reduxjs/toolkit";
import { RootState } from "../../store/rootReducer";
import {
  addRawCardsData,
  bulkLoadCardsDataForPack,
  bulkLoadCardsForEncounterSet,
} from "./cards-data.slice";
import { GameType } from "../../game-modules/GameType";
import { doneLoadingJSON } from "../game/game.slice";
import GameManager from "../../game-modules/GameModuleManager";
import Papa from "papaparse";
import { sendNotification } from "../notifications/notifications.slice";
import { v4 } from "uuid";
import { CardData } from "../../external-api/common-card-data";

export interface CustomCard {
  id: string;
  name: string;
  landscape: boolean;
  frontImageUrl: string;
  backImageUrl: string;
}

export interface InputCustomCard {
  id: string;
  name: string;
  landscape: "Y" | "N" | "y" | "n" | "YES" | "NO" | "Yes" | "No" | "yes" | "no";
  frontImageUrl: string;
  backImageUrl: string;
}

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

    // now get any localStorage custom cards
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

    dispatch(doneLoadingJSON());
  };

export const parseCsvCustomCards =
  (
    gameType: GameType,
    csvString: string
  ): ThunkAction<void, RootState, unknown, Action<string>> =>
  async (dispatch) => {
    const parsedCsv = Papa.parse(csvString, { header: true });

    // go through and convert to array of json
    if (parsedCsv.errors.length > 0) {
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

    const customCards = (parsedCsv.data as InputCustomCard[]).map(
      (d: InputCustomCard): CustomCard => {
        const returnObj = {
          ...d,
          landscape: d.landscape.toLocaleLowerCase().includes("y"),
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
        setCode: null,
      },
      name: c.name,
      typeCode: c.landscape ? "custom_landscape" : "custom",
      quantity: 1,
      octgnId: null,
      subTypeCode: null,
    }));

    const isPlayerCard = false;

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
  };
