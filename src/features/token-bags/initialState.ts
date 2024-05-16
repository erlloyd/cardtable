import { Vector2d } from "konva/lib/types";
import { myPeerRef, PlayerColor } from "../../constants/app-constants";
import { loadState } from "../../store/localStorage";
import JSONCrush from "jsoncrush";
import { v4 } from "uuid";

export interface ITokenBagsState {
  bags: ITokenBag[];
  menuPosition: Vector2d | null;
}

export interface ITokenBag {
  id: string;
  position: Vector2d;
  tokens: IToken[];
  bagImgUrl: string;
}

export interface IToken {
  code: string;
  name: string;
  frontImgUrl: string;
  backImgUrl?: string;
  currentNumberInBag: number;
}

export interface TokenMap {
  [key: string]: IToken;
}

const queryParams = new URLSearchParams(window.location.search);
const queryParamsTokenBagsString = queryParams.get("token-bags");
const queryParamsTokenBags = !!queryParamsTokenBagsString
  ? JSON.parse(JSONCrush.uncrush(queryParamsTokenBagsString))
  : null;

const localStorageState: ITokenBagsState =
  queryParamsTokenBags || (loadState("liveState")?.tokenBags ?? {});

localStorageState.menuPosition = null;

const defaultState: ITokenBagsState = {
  bags: [],
  menuPosition: null,
};
export const initialState: ITokenBagsState = {
  ...defaultState,
  ...localStorageState,
};
