import { Action, ThunkAction } from "@reduxjs/toolkit";
import axios, { AxiosResponse } from "axios";
import { Scenario } from "../../external-api/beorn-json-data";
import scenarioListLOTR from "../../external/ringsteki-json-data/scenarios.json";
import { RootState } from "../../store/rootReducer";
import {
  bulkLoadCardsDataForPack,
  bulkLoadCardsForEncounterSet,
} from "./cards-data.slice";
import { GameType } from "../../game-modules/GameModule";
import { doneLoadingJSON } from "../game/game.slice";
import log from "loglevel";
import GameManager from "../../game-modules/GameModuleManager";

export const allJsonData =
  (gameType: GameType): ThunkAction<void, RootState, unknown, Action<string>> =>
  async (dispatch) => {
    // let resultsList = await Promise.all(
    //   marvelPackList.map((pack) => getSpecificMarvelPack(pack))
    // );

    // let failed = resultsList.filter((r) => r.res.status !== 200);
    // if (failed.length > 0) {
    //   log.error(
    //     "Failed to load some JSON data:",
    //     failed.map((r) => r.packCode)
    //   );
    // }

    // const cardsData = resultsList
    //   .filter((r) => r.res.status === 200)
    //   .map((r) => {
    //     return {
    //       packType: GameType.MarvelChampions,
    //       pack: r.res.data as any,
    //       pack_code: r.packCode,
    //     };
    //   });

    const cardsData = await GameManager.getModuleForType(
      gameType
    ).getCardsData();

    if (!!cardsData && cardsData.length > 0) {
      dispatch(bulkLoadCardsDataForPack(cardsData));
    }

    if (gameType === GameType.LordOfTheRingsLivingCardGame) {
      const resultsListLOTRScenarios = await Promise.all(
        scenarioListLOTR.map((scenario) =>
          getSpecificLOTRScenario(scenario.Title)
        )
      );

      const failedScenario = resultsListLOTRScenarios.filter(
        (r) => r.status !== 200
      );
      if (failedScenario.length > 0) {
        log.error(
          "Failed to load some JSON data:",
          failedScenario.map((r) => r.data.Slug)
        );
      }

      const scenarioData = resultsListLOTRScenarios.map((r) => {
        return {
          setCode: r.data.Slug,
          cards: r.data.AllCards,
        };
      });

      dispatch(bulkLoadCardsForEncounterSet(scenarioData));
    }
    dispatch(doneLoadingJSON());
  };

const getSpecificLOTRScenario = async (
  scenario: string
): Promise<AxiosResponse<Scenario>> => {
  const response = await axios.get<Scenario>(
    process.env.PUBLIC_URL + "/json_data/scenarios/" + scenario + ".json"
  );
  return response;
};
