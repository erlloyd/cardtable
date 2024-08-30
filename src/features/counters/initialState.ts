import { Vector2d } from "konva/lib/types";
import { PlayerColor } from "../../constants/app-constants";
import { loadState } from "../../store/localStorage";
import JSONCrush from "jsoncrush";

export interface ICountersState {
  counters: ICounter[];
  firstPlayerCounterPosition: Vector2d;
  flippableTokens: IFlippableToken[];
}
export interface IFlippableToken {
  id: string;
  position: Vector2d;
  faceup: boolean;
  imgUrl: string;
  backImgUrl?: string;
  controlledBy: string | null;
}

export interface ICounter {
  id: string;
  position: Vector2d;
  value: number;
  color: PlayerColor;
  imgUrl?: string;
  text?: string;
}

const queryParams = new URLSearchParams(window.location.search);
const queryParamsCountersString = queryParams.get("counters");
const queryParamsCounters = !!queryParamsCountersString
  ? JSON.parse(JSONCrush.uncrush(queryParamsCountersString))
  : null;

const localStorageState: ICountersState =
  queryParamsCounters || (loadState("liveState")?.counters ?? {});

if (localStorageState.flippableTokens === undefined) {
  localStorageState.flippableTokens = [];
}

localStorageState.flippableTokens.forEach((ft) => {
  ft.controlledBy = null;
});

export const defaultState: ICountersState = {
  counters: [],
  firstPlayerCounterPosition: { x: 100, y: 0 },
  flippableTokens: [],
};
export const initialState: ICountersState = {
  ...defaultState,
  ...localStorageState,
};
