import {
  createSlice,
  CaseReducer,
  PayloadAction,
  Draft,
} from "@reduxjs/toolkit";
import {
  initialState,
  ICardsDataState,
  IGameCardsDataStateStored,
} from "./initialState";

// import * as PackData from "../../generated/packs";
// import { CardData as CardDataLOTR } from "../../external-api/beorn-json-data";
import {
  CardData as CardDataMarvel,
  CardPack as CardPackMarvel,
} from "../../external-api/marvel-card-data";
import SetData from "../../external/marvelsdb-json-data/sets.json";
import Scenarios from "../../external/ringsteki-json-data/scenarios.json";
import { CardData } from "../../external-api/common-card-data";
import { GameType } from "../../constants/app-constants";
import {
  CardPack as CardPackLOTR,
  CardData as CardDataLOTR,
} from "../../external-api/beorn-json-data";
import { updateActiveGameType } from "../game/game.slice";
import { receiveRemoteGameState } from "../../store/global.actions";
import { getCardCodeIncludingOverrides } from "../../utilities/cards-data-utils";
import {
  FORCE_CARD_BACK_MAP,
  MISSING_BACK_IMAGE_MAP,
} from "../../constants/card-missing-image-map";

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
    duplicate_of: cardMarvelFormat.duplicate_of,
  };
  return mappedCardData;
};

const convertLOTRToCommonFormat =
  (encounterCard: boolean) =>
  (cardLOTRFormat: CardDataLOTR): CardData => {
    // if (!cardLOTRFormat.RingsDbCardId) {
    //   console.log(
    //     `No RingsDB Id for ${cardLOTRFormat.Slug} from ${cardLOTRFormat.CardSet}`
    //   );
    // }

    // if (cardLOTRFormat.Front && !cardLOTRFormat.Front.ImagePath) {
    //   console.log(
    //     `No Front Image Path for ${cardLOTRFormat.Slug} from ${cardLOTRFormat.CardSet}`
    //   );
    // }

    let cardBackImage = cardLOTRFormat.Back?.ImagePath;

    if (cardLOTRFormat.Back && !cardLOTRFormat.Back.ImagePath) {
      const frontImage = cardLOTRFormat.Front.ImagePath;
      const frontImageWithoutExtension = frontImage
        .split(".")
        .slice(0, -1)
        .join(".");
      if (
        frontImageWithoutExtension[frontImageWithoutExtension.length - 1] !==
        "A"
      ) {
        if (MISSING_BACK_IMAGE_MAP[cardLOTRFormat.RingsDbCardId]) {
          cardBackImage = MISSING_BACK_IMAGE_MAP[cardLOTRFormat.RingsDbCardId];
        } else {
          console.log(
            `No Non-B Back Image Path for ${cardLOTRFormat.Slug} from ${cardLOTRFormat.CardSet}`,
            cardLOTRFormat.RingsDbCardId
          );
        }
      } else {
        cardBackImage = frontImage.replaceAll("A.", "B.");
      }
    }

    const mappedCardData: CardData = {
      code: encounterCard
        ? cardLOTRFormat.Slug
        : getCardCodeIncludingOverrides(cardLOTRFormat),
      name: cardLOTRFormat.Title,
      images: {
        front: cardLOTRFormat.Front.ImagePath,
        back: cardBackImage ?? null,
      },
      octgnId: cardLOTRFormat.OctgnGuid ?? null,
      quantity: cardLOTRFormat.Quantity ?? 1,
      doubleSided: !!cardLOTRFormat.Back,
      backLink: null,
      typeCode: cardLOTRFormat.CardType,
      subTypeCode: cardLOTRFormat.CardSubType,
      extraInfo: {
        campaign: cardLOTRFormat.CAMPAIGN,
        setCode: cardLOTRFormat.CardSet ?? null,
        packCode: "TODO - lotr",
        factionCode: encounterCard ? "encounter" : "player",
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

  let activeData = state.data[GameType.MarvelChampions];
  if (!!activeData) {
    activeData.setData = {};
  } else {
    state.data[GameType.MarvelChampions] = {
      entities: {},
      encounterEntities: {},
      setData: {},
    };
    activeData = state.data[GameType.MarvelChampions];
  }

  SetData.forEach((set) => {
    if (!!activeData) {
      activeData.setData[set.code] = {
        name: set.name,
        setTypeCode: set.card_set_type_code,
        cardsInSet: [],
      };
    }
  });

  activeData = state.data[GameType.LordOfTheRingsLivingCardGame];

  if (!!activeData) {
    activeData.setData = {};
  } else {
    state.data[GameType.LordOfTheRingsLivingCardGame] = {
      entities: {},
      encounterEntities: {},
      setData: {},
    };
    activeData = state.data[GameType.LordOfTheRingsLivingCardGame];
  }

  Scenarios.forEach((scenario) => {
    if (!!activeData) {
      activeData.setData[scenario.Slug] = {
        name: scenario.Title,
        setTypeCode: scenario.Product,
        cardsInSet: [],
      };
    }
  });

  return state;
};

const storeCardData =
  (isPlayerPack: boolean) =>
  (cs: {
    location: Draft<IGameCardsDataStateStored> | undefined;
    card: CardData;
  }) => {
    const stateLocation = isPlayerPack
      ? (cs.location as IGameCardsDataStateStored).entities
      : (cs.location as IGameCardsDataStateStored).encounterEntities;

    if (!(cs.card.code[0] === "0" && cs.card.code[1] === "0")) {
      if (
        stateLocation[cs.card.code] &&
        stateLocation[cs.card.code].length > 0
      ) {
        // If we have an explicit back, don't worry about it
        if (!!FORCE_CARD_BACK_MAP[cs.card.code]) {
          return;
        }

        // Only error if the code and name are different
        if (cs.card.name !== stateLocation[cs.card.code][0].name) {
          console.error(
            "Found multiple cards with code " +
              cs.card.code +
              " " +
              cs.card.name +
              " " +
              cs.card.extraInfo.setCode +
              " Existing card(s) are " +
              stateLocation[cs.card.code].map((c) => c.name) +
              " " +
              stateLocation[cs.card.code].map((c) => c.extraInfo.setCode)
          );
          console.log(cs.card);
          console.log(stateLocation[cs.card.code]);
        }
      } else {
        stateLocation[cs.card.code] = [];
      }
      stateLocation[cs.card.code] = stateLocation[cs.card.code].concat([
        cs.card,
      ]);
    }
  };

const bulkLoadCardsForEncounterSetReducer: CaseReducer<
  ICardsDataState,
  PayloadAction<
    {
      setCode: string;
      cards: CardDataLOTR[];
    }[]
  >
> = (state, action) => {
  action.payload.forEach((r) =>
    loadCardsForEncounterSetReducer(state, {
      type: loadCardsForEncounterSet.type,
      payload: r,
    })
  );
};

const loadCardsForEncounterSetReducer: CaseReducer<
  ICardsDataState,
  PayloadAction<{
    setCode: string;
    cards: CardDataLOTR[];
  }>
> = (state, action) => {
  const activeData = state.data[GameType.LordOfTheRingsLivingCardGame];
  const activeSet = activeData?.setData[action.payload.setCode];

  if (!action.payload.cards.map) {
    console.log("No cards found for scenario " + action.payload.setCode);
    return;
  }

  action.payload.cards
    .map(convertLOTRToCommonFormat(true))
    .map((c) => {
      return {
        location: state.data[GameType.LordOfTheRingsLivingCardGame],
        card: c,
      };
    })
    .forEach(storeCardData(false));

  if (!!activeSet) {
    activeSet.cardsInSet = activeSet.cardsInSet.concat(
      action.payload.cards
        .filter(
          (cd) => cd.CardSet.toLocaleLowerCase().indexOf("nightmare") === -1
        )
        .map((cd) => {
          return {
            code: cd.Slug,
            quantity: cd.Quantity,
          };
        })
    );
  }

  return state;
};

const bulkLoadCardsDataForPackReducer: CaseReducer<
  ICardsDataState,
  PayloadAction<
    {
      packType: GameType;
      pack: CardPackMarvel | CardPackLOTR;
      pack_code: string;
    }[]
  >
> = (state, action) => {
  action.payload.forEach((r) =>
    loadCardsDataForPackReducer(state, {
      type: loadCardsDataForPack.type,
      payload: r,
    })
  );
};

const loadCardsDataForPackReducer: CaseReducer<
  ICardsDataState,
  PayloadAction<{
    packType: GameType;
    pack: CardPackMarvel | CardPackLOTR;
    pack_code: string;
  }>
> = (state, action) => {
  if (!state.data[action.payload.packType]) {
    state.data[action.payload.packType] = {
      entities: {},
      encounterEntities: {},
      setData: {},
    };
  }

  if (action.payload.packType === GameType.MarvelChampions) {
    //This reducer is only intended to be called a single time each load.
    const isHeroPack = !action.payload.pack_code.includes("_encounter");

    const pack = action.payload.pack as CardPackMarvel;

    pack
      .map(convertMarvelToCommonFormat)
      .map((c) => {
        return { location: state.data[action.payload.packType], card: c };
      })
      .forEach(storeCardData(isHeroPack));
  } else if (
    action.payload.packType === GameType.LordOfTheRingsLivingCardGame
  ) {
    const pack = action.payload.pack as CardPackLOTR;
    if (!pack.cards) {
      console.log(pack);
    }
    pack.cards
      .map(convertLOTRToCommonFormat(false))
      .map((c) => {
        return { location: state.data[action.payload.packType], card: c };
      })
      .forEach(storeCardData(true));
  }

  return state;
};

// slice
const cardsDataSlice = createSlice({
  name: "cardsData",
  initialState: initialState,
  reducers: {
    loadCardsData: loadCardsDataReducer,
    loadCardsDataForPack: loadCardsDataForPackReducer,
    bulkLoadCardsDataForPack: bulkLoadCardsDataForPackReducer,
    loadCardsForEncounterSet: loadCardsForEncounterSetReducer,
    bulkLoadCardsForEncounterSet: bulkLoadCardsForEncounterSetReducer,
  },
  extraReducers: (builder) => {
    builder.addCase(receiveRemoteGameState, (state, action) => {
      state.activeDataType =
        action.payload.game.activeGameType ?? GameType.MarvelChampions;
    });
    builder.addCase(updateActiveGameType, (state, action) => {
      state.activeDataType = action.payload;
    });
  },
});

export const {
  loadCardsData,
  loadCardsDataForPack,
  bulkLoadCardsDataForPack,
  loadCardsForEncounterSet,
  bulkLoadCardsForEncounterSet,
} = cardsDataSlice.actions;

export default cardsDataSlice.reducer;
