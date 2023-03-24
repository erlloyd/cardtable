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
import log from "loglevel";

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
  (setType: string, encounterCard: boolean) =>
  (cardLOTRFormat: CardDataLOTR): CardData => {
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
          log.warn(
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
        setType: setType,
        factionCode: encounterCard ? "encounter" : "player",
      },
    };
    return mappedCardData;
  };

// Reducers
const loadCardsDataReducer: CaseReducer<ICardsDataState> = (state) => {
  //This reducer is only intended to be called a single time each load.
  state.data = {};

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

        // Next check if the card we are about to add is exactly the
        // same as any other card, if so, skip it
        if (
          stateLocation[cs.card.code].some(
            (c) => JSON.stringify(cs.card) === JSON.stringify(c)
          )
        ) {
          return;
        }

        // Only error if the code and name are different
        if (cs.card.name !== stateLocation[cs.card.code][0].name) {
          log.warn(
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
          log.warn(cs.card);
          log.warn(stateLocation[cs.card.code]);
        }
      } else {
        stateLocation[cs.card.code] = [];
      }

      stateLocation[cs.card.code] = stateLocation[cs.card.code].concat([
        cs.card,
      ]);

      // TODO: Sort here so that custom scenario cards are behind others
      stateLocation[cs.card.code] = stateLocation[cs.card.code].sort((a, b) => {
        if (
          a.extraInfo.setType === "Custom_Scenario_Kit" ||
          a.extraInfo.setType === "Fellowship_Deck"
        ) {
          return 1;
        }

        if (
          b.extraInfo.setType === "Custom_Scenario_Kit" ||
          b.extraInfo.setType === "Fellowship_Deck"
        ) {
          return -1;
        }

        return 0;
      });

      if (stateLocation[cs.card.code].length > 1) {
        log.info(
          `Stored multiple versions of card ${cs.card.code}, now is`,
          stateLocation[cs.card.code]
        );
      }
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
    log.warn("No cards found for scenario " + action.payload.setCode);
    return;
  }

  action.payload.cards
    .map(convertLOTRToCommonFormat("todo - encounter set", true))
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
      log.warn(pack);
    }
    pack.cards
      .map(convertLOTRToCommonFormat(pack.SetType, false))
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
