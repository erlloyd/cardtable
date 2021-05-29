import { Vector2d } from "konva/lib/types";
import {
  GameType,
  myPeerRef,
  PlayerColor,
} from "../../constants/app-constants";
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
  menuPreviewCardJsonId: string | null;
  activeGameType: GameType | null;
}

const queryParams = new URLSearchParams(window.location.search);
const queryParamsGameType = queryParams.get("gameType");

const localStorageState: IGameState = !!queryParamsGameType
  ? { activeGameType: queryParamsGameType }
  : loadState("game");

localStorageState.playerColors = {};
localStorageState.playerColors[myPeerRef] = "red";
localStorageState.peerId = "";
localStorageState.previewCard = null;
localStorageState.menuPreviewCardJsonId = null;

const defaultState: IGameState = {
  playerColors: {},
  stageZoom: { x: 0.5, y: 0.5 },
  stagePosition: { x: 0, y: 0 },
  peerId: "",
  previewCard: null,
  menuPreviewCardJsonId: null,
  activeGameType: null,
};
export const initialState: IGameState = {
  ...defaultState,
  ...localStorageState,
};
