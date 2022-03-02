import { Vector2d } from "konva/lib/types";
import { myPeerRef, PlayerColor } from "../../constants/app-constants";
import { loadState } from "../../store/localStorage";
import JSONCrush from "jsoncrush";

export interface IArrowsState {
  arrows: { [key: string]: IArrow[] };
}

export interface IArrow {
  startCardId: string;
  endCardId?: string | null;
  endArrowPosition?: Vector2d | null;
  color: PlayerColor;
}

const queryParams = new URLSearchParams(window.location.search);
const queryParamsArrowsString = queryParams.get("arrows");
const queryParamsArrows = !!queryParamsArrowsString
  ? JSON.parse(JSONCrush.uncrush(queryParamsArrowsString))
  : null;

const localStorageState: IArrowsState =
  queryParamsArrows || (loadState("liveState")?.arrows ?? {});

localStorageState.arrows = {
  [myPeerRef]: [{ startCardId: "blah", color: "red" }],
};

const defaultState: IArrowsState = {
  arrows: {},
};
export const initialState: IArrowsState = {
  ...defaultState,
  ...localStorageState,
};
