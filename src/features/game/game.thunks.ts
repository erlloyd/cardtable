import { Action, ThunkAction } from "@reduxjs/toolkit";
import { RootState } from "../../store/rootReducer";
import JSONCrush from "jsoncrush";
import { copyToClipboard, getBaseUrl } from "../../utilities/text-utils";
import { ICardStack } from "../cards/initialState";
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
    cardStack: ICardStack | undefined
  ): ThunkAction<void, RootState, unknown, Action<any>> =>
  () => {
    if (!cardStack || cardStack.cardStack.length < 1) return;

    const topCard = cardStack.cardStack[0];

    // convert to an object
    const objectData: any = {
      data: {
        investigator_code: topCard.jsonId,
      },
    };

    const slots: { [key: string]: number } = {};

    cardStack.cardStack.forEach((c, index) => {
      if (index === 0) return;

      if (!!slots[c.jsonId]) {
        slots[c.jsonId] = slots[c.jsonId] + 1;
      } else {
        slots[c.jsonId] = 1;
      }
    });

    objectData.data.slots = slots;

    let filename = `${topCard.jsonId}_deck.json`;
    let contentType = "application/json;charset=utf-8;";

    var a = document.createElement("a");
    a.style.display = "none";
    a.download = filename;
    a.href =
      "data:" +
      contentType +
      "," +
      encodeURIComponent(JSON.stringify(objectData, null, 2));
    a.target = "_blank";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };
