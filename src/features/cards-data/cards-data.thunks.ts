import { Action, ThunkAction } from "@reduxjs/toolkit";
import axios, { AxiosResponse } from "axios";
import { CardPack as CardPackMarvel } from "../../external-api/marvel-card-data";
import {
  CardPack as CardPackLOTR,
  Scenario,
} from "../../external-api/beorn-json-data";
import { packList as marvelPackList } from "../../generated/packsList";
import { packList as lotrPackList } from "../../generated/packsList_lotr";
import scenarioListLOTR from "../../external/ringsteki-json-data/scenarios.json";
import { RootState } from "../../store/rootReducer";
import {
  bulkLoadCardsDataForPack,
  bulkLoadCardsForEncounterSet,
} from "./cards-data.slice";
import { GameType } from "../../game-modules/GameModule";
import { doneLoadingJSON } from "../game/game.slice";
import log from "loglevel";

export const allJsonData =
  (): ThunkAction<void, RootState, unknown, Action<string>> =>
  async (dispatch) => {
    let resultsList = await Promise.all(
      marvelPackList.map((pack) => getSpecificMarvelPack(pack))
    );

    let failed = resultsList.filter((r) => r.res.status !== 200);
    if (failed.length > 0) {
      log.error(
        "Failed to load some JSON data:",
        failed.map((r) => r.packCode)
      );
    }

    const cardsData = resultsList
      .filter((r) => r.res.status === 200)
      .map((r) => {
        return {
          packType: GameType.MarvelChampions,
          pack: r.res.data as any,
          pack_code: r.packCode,
        };
      });

    dispatch(bulkLoadCardsDataForPack(cardsData));

    const resultsListLOTR = await Promise.all(
      lotrPackList.map((pack) => getSpecificLOTRPack(pack))
    );

    failed = resultsList.filter((r) => r.res.status !== 200);
    if (failed.length > 0) {
      log.error(
        "Failed to load some JSON data:",
        failed.map((r) => r.packCode)
      );
    }

    const cardsDataLOTR = resultsListLOTR
      .filter((r) => r.res.status === 200)
      .map((r) => {
        return {
          packType: GameType.LordOfTheRingsLivingCardGame,
          pack: r.res.data as any,
          pack_code: r.packCode,
        };
      });

    dispatch(bulkLoadCardsDataForPack(cardsDataLOTR));

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

    dispatch(doneLoadingJSON());
  };

const getSpecificMarvelPack = async (
  packName: string
): Promise<{ res: AxiosResponse<CardPackMarvel>; packCode: string }> => {
  const response = await axios.get<CardPackMarvel>(
    process.env.PUBLIC_URL + "/json_data/" + packName
  );
  return {
    res: response,
    packCode: packName.split(".json")[0],
  };
};

const getSpecificLOTRPack = async (
  packName: string
): Promise<{ res: AxiosResponse<CardPackLOTR>; packCode: string }> => {
  const response = await axios.get<CardPackLOTR>(
    process.env.PUBLIC_URL + "/json_data/" + packName
  );
  return {
    res: response,
    packCode: packName.split(".json")[0],
  };
};

const getSpecificLOTRScenario = async (
  scenario: string
): Promise<AxiosResponse<Scenario>> => {
  const response = await axios.get<Scenario>(
    process.env.PUBLIC_URL + "/json_data/scenarios/" + scenario + ".json"
  );
  return response;
};
