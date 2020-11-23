import { createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import { Vector2d } from "konva/types/types";

export const fetchDecklistById = createAsyncThunk(
  "decklist/fetchByIdStatus",
  async (payload: { decklistId: number; position: Vector2d }) => {
    const response = await axios.get(
      `https://marvelcdb.com/api/public/decklist/${payload.decklistId}`
    );
    return { position: payload.position, data: response.data };
  }
);
