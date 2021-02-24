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
  loadCardsDataForPack,
  loadCardsForEncounterSet,
} from "./cards-data.slice";
import { GameType } from "../../constants/app-constants";

export const allJsonData = (): ThunkAction<
  void,
  RootState,
  unknown,
  Action<string>
> => async (dispatch) => {
  let resultsList = await Promise.all(
    marvelPackList.map((pack) => getSpecificMarvelPack(pack))
  );

  resultsList.forEach((result) => {
    if (result.res.status === 200) {
      dispatch(
        loadCardsDataForPack({
          packType: GameType.MarvelChampions,
          pack: result.res.data as any,
          pack_code: result.packCode,
        })
      );
    } else {
      console.error("Failed to load some json data");
    }
  });

  const resultsListLOTR = await Promise.all(
    lotrPackList.map((pack) => getSpecificLOTRPack(pack))
  );

  resultsListLOTR.forEach((result) => {
    if (result.res.status === 200) {
      dispatch(
        loadCardsDataForPack({
          packType: GameType.LordOfTheRingsLivingCardGame,
          pack: result.res.data as any,
          pack_code: result.packCode,
        })
      );
    } else {
      console.error("Failed to load some json data");
    }
  });

  const resultsListLOTRScenarios = await Promise.all(
    scenarioListLOTR.map((scenario) => getSpecificLOTRScenario(scenario.Title))
  );

  resultsListLOTRScenarios.forEach((result) => {
    if (result.status === 200) {
      dispatch(
        loadCardsForEncounterSet({
          setCode: result.data.Slug,
          cards: result.data.AllCards,
        })
      );
    } else {
      console.error("Failed to load some json data");
    }
  });
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
