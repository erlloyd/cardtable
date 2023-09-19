import { Vector2d } from "konva/lib/types";
import { myPeerRef, PlayerColor } from "../../constants/app-constants";
import { loadState } from "../../store/localStorage";
import JSONCrush from "jsoncrush";

export interface IPlaymatsState {
  playmats: IPlaymat[];
}

export interface IPlaymat {
  id: string;
  imgUrl: string;
  gridRow: number;
  gridColumn: number;
}

const queryParams = new URLSearchParams(window.location.search);
const queryParamsPlaymatsString = queryParams.get("playmats");
const queryParamsPlaymats = !!queryParamsPlaymatsString
  ? JSON.parse(JSONCrush.uncrush(queryParamsPlaymatsString))
  : null;

const localStorageState: IPlaymatsState =
  queryParamsPlaymats || (loadState("liveState")?.playmats ?? {});

const defaultState: IPlaymatsState = {
  playmats: [],
};
export const initialState: IPlaymatsState = {
  ...defaultState,
  ...localStorageState,
};
