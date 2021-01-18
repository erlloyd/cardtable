import { Action, createAsyncThunk, ThunkAction } from "@reduxjs/toolkit";
import axios from "axios";
import { Vector2d } from "konva/types/types";
import { RootState } from "../../store/rootReducer";
import {
  getCardsDataEncounterEntities,
  getCardsDataHeroEntities,
} from "../cards-data/cards-data.selectors";
import { v4 as uuidv4 } from "uuid";
import {
  addCardStackWithId,
  pullCardOutOfCardStackWithId,
  startCardMoveWithSplitStackId,
} from "./cards.actions";

interface AddCardStackPayload {
  cardJsonIds: string[];
  position: Vector2d;
}

export interface PullCardOutOfCardStackPayload {
  cardStackId: string;
  jsonId: string;
  pos: Vector2d;
}

export interface StartCardMovePayload {
  id: string;
  splitTopCard: boolean;
}

export const addCardStack = (
  payload: AddCardStackPayload
): ThunkAction<void, RootState, unknown, Action<string>> => (dispatch) => {
  const payloadWithId = {
    ...payload,
    id: uuidv4(),
  };
  dispatch(addCardStackWithId(payloadWithId));
};

export const pullCardOutOfCardStack = (
  payload: PullCardOutOfCardStackPayload
): ThunkAction<void, RootState, unknown, Action<string>> => (dispatch) => {
  const payloadWithId = {
    ...payload,
    id: uuidv4(),
  };
  dispatch(pullCardOutOfCardStackWithId(payloadWithId));
};

export const startCardMove = (
  payload: StartCardMovePayload
): ThunkAction<void, RootState, unknown, Action<string>> => (dispatch) => {
  const payloadWithId = {
    ...payload,
    splitCardId: uuidv4(),
  };
  dispatch(startCardMoveWithSplitStackId(payloadWithId));
};

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
