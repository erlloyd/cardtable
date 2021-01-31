import { Vector2d } from "konva/types/types";
import { myPeerRef, PlayerColor } from "../../constants/app-constants";
import { loadState } from "../../store/localStorage";

export interface IGameState {
  stageZoom: Vector2d;
  stagePosition: Vector2d;
  playerColors: { [key: string]: PlayerColor };
  peerId: string;
}

const localStorageState: IGameState = loadState("game");
localStorageState.playerColors = {};
localStorageState.playerColors[myPeerRef] = "red";
localStorageState.peerId = "";

const defaultState: IGameState = {
  playerColors: {},
  stageZoom: { x: 1, y: 1 },
  stagePosition: { x: 0, y: 0 },
  peerId: "",
};
export const initialState: IGameState = {
  ...defaultState,
  ...localStorageState,
};
