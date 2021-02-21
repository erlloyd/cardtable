import {
  createSlice,
  CaseReducer,
  PayloadAction,
  Draft,
} from "@reduxjs/toolkit";
import {
  initialState,
  ICardsDataState,
  IGameCardsDataState,
} from "./initialState";

// import * as PackData from "../../generated/packs";
// import { CardData as CardDataLOTR } from "../../external-api/beorn-json-data";
import {
  CardData as CardDataMarvel,
  CardPack as CardPackMarvel,
} from "../../external-api/marvel-card-data";
import SetData from "../../external/marvelsdb-json-data/sets.json";
import { CardData } from "../../external-api/common-card-data";
import { GameType } from "../../constants/app-constants";
import { CardPack as CardPackLOTR } from "../../external-api/beorn-json-data";
import { updateActiveGameType } from "../game/game.slice";

// Utilities
const convertMarvelToCommonFormat = (
  cardMarvelFormat: CardDataMarvel
): CardData => {
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
    },
  };
  return mappedCardData;
};

// Reducers
const loadCardsDataReducer: CaseReducer<ICardsDataState> = (state) => {
  //This reducer is only intended to be called a single time each load.
  state.data = {};
  // const heroPacks = Object.entries(PackData)
  //   .filter(([key, _value]) => !key.includes("_encounter"))
  //   .map(([key, value]) => (value as unknown) as CardPackMarvel);

  // const encounterPacks = Object.entries(PackData)
  //   .filter(([key, value]) => key.includes("_encounter"))
  //   .map(([key, value]) => (value as unknown) as CardPackMarvel);

  // heroPacks.forEach((pack) =>
  //   pack.map(convertMarvelToCommonFormat).forEach((card: CardData) => {
  //     if (state.entities[card.code]) {
  //       console.error("Found multiple cards with code " + card.code);
  //     }

  //     // if (!card.octgn_id) {
  //     //   console.error(`Card ${card.code} had no octgn_id!`);
  //     // }

  //     state.entities[card.code] = card;
  //   })
  // );

  // encounterPacks.forEach((pack) =>
  //   pack.map(convertMarvelToCommonFormat).forEach((card: CardData) => {
  //     if (state.encounterEntities[card.code]) {
  //       console.error("Found multiple cards with code " + card.code);
  //     }

  //     // if (!card.octgn_id) {
  //     //   console.error(`Card ${card.code}: ${card.name} had no octgn_id!`);
  //     // }

  //     state.encounterEntities[card.code] = card;
  //   })
  // );

  if (state.activeDataType === GameType.MarvelChampions) {
    let activeData = state.data[state.activeDataType];
    if (!!activeData) {
      activeData.setData = {};
    } else {
      state.data[state.activeDataType] = {
        entities: {},
        encounterEntities: {},
        setData: {},
      };
      activeData = state.data[state.activeDataType];
    }

    SetData.forEach((set) => {
      if (!!activeData) {
        activeData.setData[set.code] = {
          name: set.name,
          setTypeCode: set.card_set_type_code,
        };
      }
    });
  }

  return state;
};

const storeCardData = (isPlayerPack: boolean) => (cs: {
  location: Draft<IGameCardsDataState> | undefined;
  card: CardData;
}) => {
  const stateLocation = isPlayerPack
    ? (cs.location as IGameCardsDataState).entities
    : (cs.location as IGameCardsDataState).encounterEntities;
  if (stateLocation[cs.card.code]) {
    console.error("Found multiple cards with code " + cs.card.code);
  }

  // if (!card.octgn_id) {
  //   console.error(`Card ${card.code} had no octgn_id!`);
  // }

  stateLocation[cs.card.code] = cs.card;
};

const loadCardsDataForPackReducer: CaseReducer<
  ICardsDataState,
  PayloadAction<{
    packType: GameType;
    pack: CardPackMarvel | CardPackLOTR;
    pack_code: string;
  }>
> = (state, action) => {
  if (action.payload.packType === GameType.MarvelChampions) {
    //This reducer is only intended to be called a single time each load.
    const isHeroPack = !action.payload.pack_code.includes("_encounter");

    const pack = action.payload.pack as CardPackMarvel;

    if (!state.data[action.payload.packType]) {
      state.data[action.payload.packType] = {
        entities: {},
        encounterEntities: {},
        setData: {},
      };
    }

    pack
      .map(convertMarvelToCommonFormat)
      .map((c) => {
        return { location: state.data[action.payload.packType], card: c };
      })
      .forEach(storeCardData(isHeroPack));
  }
  // SetData.forEach((set) => {
  //   state.setData[set.code] = {
  //     name: set.name,
  //     setTypeCode: set.card_set_type_code,
  //   };
  // });

  return state;
};

// slice
const cardsDataSlice = createSlice({
  name: "cardsData",
  initialState: initialState,
  reducers: {
    loadCardsData: loadCardsDataReducer,
    loadCardsDataForPack: loadCardsDataForPackReducer,
  },
  extraReducers: (builder) => {
    builder.addCase(updateActiveGameType, (state, action) => {
      state.activeDataType = action.payload;
    });
  },
});

export const { loadCardsData, loadCardsDataForPack } = cardsDataSlice.actions;

export default cardsDataSlice.reducer;
