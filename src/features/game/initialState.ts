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
  radialMenuPosition: Vector2d | null;
  specificCardLoaderPosition: Vector2d | null;
  playerColors: { [key: string]: PlayerColor };
  playerNumbers: { [key: string]: number };
  currentVisiblePlayerHandNumber: number | null; // If null, view your own hand
  peerId: string;
  previewCard: IPreviewCard | null;
  menuPreviewCardJsonId: string | null;
  activeGameType: GameType | null;
  draggingCardFromHand: boolean;
  drawCardsIntoHand: boolean;
  snapCardsToGrid: boolean;
  drawingArrow: boolean;
}

const queryParams = new URLSearchParams(window.location.search);
const queryParamsGameType = queryParams.get("gameType");

const localStorageState: IGameState = !!queryParamsGameType
  ? { activeGameType: queryParamsGameType }
  : loadState("game");

localStorageState.playerColors = {};
localStorageState.playerColors[myPeerRef] = "red";
localStorageState.playerNumbers = {};
localStorageState.playerNumbers[myPeerRef] = 1;
localStorageState.peerId = "";
localStorageState.previewCard = null;
localStorageState.menuPreviewCardJsonId = null;
localStorageState.radialMenuPosition = null;
localStorageState.specificCardLoaderPosition = null;
localStorageState.draggingCardFromHand = false;
localStorageState.drawingArrow = false;

// TESTING
localStorageState.snapCardsToGrid = true;

const defaultState: IGameState = {
  playerColors: {},
  playerNumbers: {},
  stageZoom: { x: 0.5, y: 0.5 },
  stagePosition: { x: 0, y: 0 },
  peerId: "",
  previewCard: null,
  menuPreviewCardJsonId: null,
  activeGameType: null,
  radialMenuPosition: null,
  specificCardLoaderPosition: null,
  draggingCardFromHand: false,
  drawCardsIntoHand: true,
  snapCardsToGrid: true,
  currentVisiblePlayerHandNumber: null,
  drawingArrow: false,
};
export const initialState: IGameState = {
  ...defaultState,
  ...localStorageState,
};
