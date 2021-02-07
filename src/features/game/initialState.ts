import { Vector2d } from "konva/types/types";
import { myPeerRef, PlayerColor } from "../../constants/app-constants";
import { loadState } from "../../store/localStorage";

export interface IPreviewCard {
  id: string;
}

export interface IGameState {
  stageZoom: Vector2d;
  stagePosition: Vector2d;
  playerColors: { [key: string]: PlayerColor };
  peerId: string;
  previewCard: IPreviewCard | null;
}

const localStorageState: IGameState = loadState("game");
localStorageState.playerColors = {};
localStorageState.playerColors[myPeerRef] = "red";
localStorageState.peerId = "";
localStorageState.previewCard = null;

const defaultState: IGameState = {
  playerColors: {},
  stageZoom: { x: 1, y: 1 },
  stagePosition: { x: 0, y: 0 },
  peerId: "",
  previewCard: null,
};
export const initialState: IGameState = {
  ...defaultState,
  ...localStorageState,
};
