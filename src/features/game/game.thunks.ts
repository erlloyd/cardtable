import { Action, ThunkAction } from "@reduxjs/toolkit";
import { RootState } from "../../store/rootReducer";
import JSONCrush from "jsoncrush";
import { copyToClipboard, getBaseUrl } from "../../utilities/text-utils";
export const generateGameStateUrl =
  (): ThunkAction<void, RootState, unknown, Action<any>> =>
  (_dispatch, getState) => {
    const currentStoreState = getState();

    const cards = currentStoreState.liveState.present.cards.cards;
    const counters = currentStoreState.liveState.present.counters;
    const gameType = currentStoreState.game.activeGameType;
    const crushedCardsString = JSONCrush.crush(JSON.stringify(cards));
    const crushedCountersString = JSONCrush.crush(JSON.stringify(counters));
    copyToClipboard(
      `${getBaseUrl()}?gameType=${gameType}&cards=${crushedCardsString}&counters=${crushedCountersString}`
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
