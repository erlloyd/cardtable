import { Vector2d } from "konva/lib/types";
import { PlayerColor } from "../../constants/app-constants";
import { loadState } from "../../store/localStorage";
import * as jc from "jsoncrush";

export interface ICountersState {
  counters: ICounter[];
  firstPlayerCounterPosition: Vector2d;
}

export interface ICounter {
  id: string;
  position: Vector2d;
  value: number;
  color: PlayerColor;
}

const queryParams = new URLSearchParams(window.location.search);
const queryParamsCountersString = queryParams.get("counters");
const queryParamsCounters = !!queryParamsCountersString
  ? JSON.parse(jc.JSONUncrush(queryParamsCountersString))
  : null;

const localStorageState: ICountersState =
  queryParamsCounters || (loadState("liveState")?.counters ?? {});

const defaultState: ICountersState = {
  counters: [],
  firstPlayerCounterPosition: { x: 0, y: 0 },
};
export const initialState: ICountersState = {
  ...defaultState,
  ...localStorageState,
};
