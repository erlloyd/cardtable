import { Action, ThunkAction } from "@reduxjs/toolkit";
import { RootState } from "../../store/rootReducer";
import {
  bulkLoadCardsDataForPack,
  bulkLoadCardsForEncounterSet,
} from "./cards-data.slice";
import { GameType } from "../../game-modules/GameModule";
import { doneLoadingJSON } from "../game/game.slice";
import GameManager from "../../game-modules/GameModuleManager";

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
    dispatch(doneLoadingJSON());
  };
