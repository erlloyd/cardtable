import { createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import { Vector2d } from "konva/types/types";
import { RootState } from "../../store/rootReducer";
import {
  getCardsDataEncounterEntities,
  getCardsDataHeroEntities,
} from "../cards-data/cards-data.selectors";
import { v4 as uuidv4 } from "uuid";

export const fetchDecklistById = createAsyncThunk(
  "decklist/fetchByIdStatus",
  async (payload: { decklistId: number; position: Vector2d }, thunkApi) => {
    const response = await axios.get(
      `https://marvelcdb.com/api/public/decklist/${payload.decklistId}`
    );
    const state: RootState = thunkApi.getState() as RootState;
    const heroCardsData = getCardsDataHeroEntities(state);
    const heroSetCode = heroCardsData[response.data.investigator_code].set_code;
    const encounterCardsData = getCardsDataEncounterEntities(state);

    const heroObligationDeck = Object.entries(encounterCardsData)
      .filter(
        ([_key, value]) =>
          value.set_code === `${heroSetCode}` &&
          value.type_code === "obligation"
      )
      .map(([key, _value]) => key);

    const heroEncounterDeck = Object.entries(encounterCardsData)
      .filter(([_key, value]) => value.set_code === `${heroSetCode}_nemesis`)
      .map(([key, _value]) => key);
    // get the encounter cards for this deck
    return {
      position: payload.position,
      heroId: uuidv4(),
      data: response.data,
      dataId: uuidv4(),
      relatedEncounterDeck: heroEncounterDeck,
      encounterDeckId: uuidv4(),
      relatedObligationDeck: heroObligationDeck,
      obligationDeckId: uuidv4(),
    };
  }
);
