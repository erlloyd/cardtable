import {
  CounterTokenType,
  StatusTokenType,
} from "../../constants/card-constants";
import { ISetData } from "../../features/cards-data/initialState";
import { GameModule, GameType, ILoadCardsData } from "../GameModule";
import SetData from "../../external/marvelsdb-json-data/sets.json";
import { packList as marvelPackList } from "../../generated/packsList";
import log from "loglevel";
import axios, { AxiosResponse } from "axios";
import { CardPack as CardPackMarvel } from "../../external-api/marvel-card-data";

import MissingCardImages from "./missing-images";

export default class MarvelChampionsGameModule extends GameModule {
  constructor() {
    const properties = {
      deckSite: "marvelcdb.com",
      decklistApi: "https://marvelcdb.com/api/public/decklist/",
      decklistSearchApi: "https://marvelcdb.com/decklists",
      decklistSearchApiConstants: "sort=likes",
      encounterUiName: "Encounter Set",
      backgroundImageLocation:
        process.env.PUBLIC_URL + "/images/table/background_marvelchampions.png",
      possibleIcons: [],
      modifiers: [
        {
          attributeId: "thwart",
          attributeName: "Thwart",
          icon: process.env.PUBLIC_URL + "/images/standard/marvel/thwart.png",
          slot: 1,
        },
        {
          attributeId: "attack",
          attributeName: "Attack",
          icon: process.env.PUBLIC_URL + "/images/standard/marvel/attack.png",
          slot: 2,
        },
        {
          attributeId: "defense",
          attributeName: "Defense",
          icon: process.env.PUBLIC_URL + "/images/standard/marvel/defense.png",
          slot: 3,
        },
      ],
      tokens: {
        stunned: {
          canStackMultiple: true,
          tokenType: StatusTokenType.Stunned,
          touchMenuLetter: null,
          menuText: "Stun",
          menuRemoveText: "Remove Stun",
          imagePath: process.env.PUBLIC_URL + "/images/standard/stunned.png",
        },
        confused: {
          canStackMultiple: true,
          tokenType: StatusTokenType.Confused,
          touchMenuLetter: null,
          menuText: "Confuse",
          menuRemoveText: "Remove Confuse",
          imagePath: process.env.PUBLIC_URL + "/images/standard/confused.png",
        },
        tough: {
          canStackMultiple: true,
          tokenType: StatusTokenType.Tough,
          touchMenuLetter: null,
          menuText: "Tough",
          menuRemoveText: "Remove Tough",
          imagePath: process.env.PUBLIC_URL + "/images/standard/tough.png",
        },
        damage: {
          counterTokenType: CounterTokenType.Damage,
          isNumeric: true,
          touchMenuLetter: "Dmg",
          menuText: "Set Damage",
          imagePath: process.env.PUBLIC_URL + "/images/standard/damage.png",
        },
        threat: {
          counterTokenType: CounterTokenType.Threat,
          isNumeric: true,
          touchMenuLetter: "Thr",
          menuText: "Set Threat",
          imagePath: process.env.PUBLIC_URL + "/images/standard/threat.png",
        },
        generic: {
          counterTokenType: CounterTokenType.Generic,
          isNumeric: true,
          touchMenuLetter: "Gen",
          menuText: "Set Generic Tokens",
          imagePath:
            process.env.PUBLIC_URL + "/images/standard/generic_counter.png",
        },
      },
    };
    super(properties, MissingCardImages);
  }

  getSetData(): ISetData {
    const setData = {} as ISetData;
    SetData.forEach((set) => {
      setData[set.code] = {
        name: set.name,
        setTypeCode: set.card_set_type_code,
        cardsInSet: [],
      };
    });

    return setData;
  }

  async getCardsData(): Promise<ILoadCardsData[]> {
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

    return resultsList
      .filter((r) => r.res.status === 200)
      .map((r) => {
        return {
          packType: GameType.MarvelChampions,
          pack: r.res.data as any,
          pack_code: r.packCode,
        };
      });
  }
}

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
