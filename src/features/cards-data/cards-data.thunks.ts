import { createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

export const allJsonData = createAsyncThunk(
  "cards-data/loadData",
  async (payload: any, thunkApi) => {
    const response = await axios.get(
      process.env.PUBLIC_URL + "/json_data/ant.json"
    );

    console.log(response);
  }
);
