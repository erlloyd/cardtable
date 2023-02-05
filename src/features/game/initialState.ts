import { Vector2d } from "konva/lib/types";
import {
  GameType,
  myPeerRef,
  PlayerColor,
} from "../../constants/app-constants";
import { loadState } from "../../store/localStorage";

export interface OnlineDeckDataMap {
  [key: string]: OnlineDeckData;
}
export interface OnlineDeckData {
  Name: string;
  Hero: string;
  By: string;
  Likes: number;
}

export interface OnlineDeckDataWithId extends OnlineDeckData {
  Id: number;
}

export interface IPreviewCard {
  id: string;
}

export interface IGameState {
  stageZoom: Vector2d;
  stagePosition: Vector2d;
  radialMenuPosition: Vector2d | null;
  specificCardLoaderPosition: Vector2d | null;
  deckSearchPosition: Vector2d | null;
  playerColors: { [key: string]: PlayerColor };
  playerNumbers: { [key: string]: number };
  currentVisiblePlayerHandNumber: number | null; // If null, view your own hand
  peerId: string;
  multiplayerGameName: string;
  previewCard: IPreviewCard | null;
  menuPreviewCardJsonId: string | null;
  activeGameType: GameType | null;
  draggingCardFromHand: boolean;
  drawCardsIntoHand: boolean;
  snapCardsToGrid: boolean;
  drawingArrow: boolean;
  searchingForOnlineDecks: boolean;
  mostRecentOnlineDeckSearchResults: OnlineDeckDataMap;
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
localStorageState.deckSearchPosition = null;
localStorageState.draggingCardFromHand = false;
localStorageState.drawingArrow = false;
localStorageState.searchingForOnlineDecks = false;
localStorageState.mostRecentOnlineDeckSearchResults = {};

// TESTING
localStorageState.snapCardsToGrid = true;

const defaultState: IGameState = {
  playerColors: {},
  playerNumbers: {},
  stageZoom: { x: 0.5, y: 0.5 },
  stagePosition: { x: 0, y: 0 },
  peerId: "",
  multiplayerGameName: "",
  previewCard: null,
  menuPreviewCardJsonId: null,
  activeGameType: null,
  radialMenuPosition: null,
  specificCardLoaderPosition: null,
  deckSearchPosition: null,
  draggingCardFromHand: false,
  drawCardsIntoHand: true,
  snapCardsToGrid: true,
  currentVisiblePlayerHandNumber: null,
  drawingArrow: false,
  searchingForOnlineDecks: false,
  mostRecentOnlineDeckSearchResults: {},
};
export const initialState: IGameState = {
  ...defaultState,
  ...localStorageState,
};
