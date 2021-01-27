import { Vector2d } from "konva/types/types";
import { loadState } from "../../store/localStorage";

export interface ICountersState {
  counters: ICounter[];
}

export interface ICounter {
  id: string;
  position: Vector2d;
  value: number;
}

const localStorageState: ICountersState = loadState("counters");

const defaultState: ICountersState = {
  counters: [],
};
export const initialState: ICountersState = {
  ...defaultState,
  ...localStorageState,
};
