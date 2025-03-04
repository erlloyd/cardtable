import axios, { AxiosResponse } from "axios";
import log from "loglevel";
import { CardPack as CardPackMarvel } from "../../external-api/marvel-card-data";
import SetData from "../../external/marvelsdb-json-data/sets.json";
import { ICardData, ISetData } from "../../features/cards-data/initialState";
import { packList as marvelPackList } from "../../generated/packsList";
import {
  GameModule,
  ILoadCardsData,
  ILoadEncounterSetData,
  ILoadedDeck,
  ILoadedDeckMetadata,
} from "../GameModule";

import { Vector2d } from "konva/lib/types";
import { CardData } from "../../external-api/common-card-data";
import { IEncounterEntity } from "../../features/cards-data/cards-data.selectors";
import { RootState } from "../../store/rootReducer";
import { GameType } from "../GameType";
import { EXTRA_CARDS } from "./extraCards";
import { getMarvelCards, MarvelDeckData } from "./getMarvelCards";
import { loadEncounterEntities } from "./loadEncounterEntities";
import MissingCardImages from "./missing-images";
import { properties } from "./properties";
import { CARD_PACK_REMAPPING } from "./remappedPacks";

export default class MarvelChampionsGameModule extends GameModule {
  constructor() {
    super(properties, MissingCardImages, EXTRA_CARDS, CARD_PACK_REMAPPING, [
      "main_scheme",
      "side_scheme",
      "player_side_scheme",
    ]);
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

  async getEncounterSetData(): Promise<ILoadEncounterSetData[]> {
    // No encounter sets for Marvel Champions
    return [];
  }

  convertCardDataToCommonFormat(packWithMetadata: {
    pack: any;
    metadata: any;
  }): CardData[] {
    const marvelPack = packWithMetadata.pack as CardPackMarvel;
    return marvelPack.map((cardMarvelFormat) => {
      const mappedCardData: CardData = {
        code: cardMarvelFormat.code,
        name: cardMarvelFormat.name,
        images: null,
        octgnId: cardMarvelFormat.octgn_id ?? null,
        quantity: cardMarvelFormat.quantity,
        doubleSided: !!cardMarvelFormat.double_sided,
        backLink: cardMarvelFormat.back_link ?? null,
        typeCode: cardMarvelFormat.type_code,
        subTypeCode: null,
        extraInfo: {
          setCode: cardMarvelFormat.set_code ?? null,
          packCode: cardMarvelFormat.pack_code,
          factionCode: cardMarvelFormat.faction_code,
          setPosition: cardMarvelFormat.set_position,
        },
        duplicate_of: cardMarvelFormat.duplicate_of,
      };
      return mappedCardData;
    });
  }

  checkIsPlayerPack(packCode: string): boolean {
    return !packCode.includes("_encounter");
  }

  parseDecklist(
    response: AxiosResponse<any, any>,
    state: RootState,
    payload: { gameType: GameType; decklistId: number; position: Vector2d }
  ): [string[], ILoadedDeck, ILoadedDeckMetadata] {
    const returnCards = getMarvelCards(response, state, payload);
    const codes = [
      returnCards.data.investigator_code ??
        returnCards.data.hero_code ??
        "unknown",
    ];

    const data = response.data as MarvelDeckData;

    return [
      codes,
      returnCards,
      { displayName: `${data.name} (${payload.decklistId})` },
    ];
  }

  getEncounterEntitiesFromState(
    setData: ISetData,
    herosData: ICardData,
    encounterEntities: ICardData
  ): IEncounterEntity[] {
    return loadEncounterEntities(setData, herosData, encounterEntities);
  }
}

const getSpecificMarvelPack = async (
  packName: string
): Promise<{ res: AxiosResponse<CardPackMarvel>; packCode: string }> => {
  const response = await axios.get<CardPackMarvel>("/json_data/" + packName);
  return {
    res: response,
    packCode: packName.split(".json")[0],
  };
};
