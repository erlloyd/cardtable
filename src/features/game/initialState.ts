import { Vector2d } from "konva/lib/types";
import { myPeerRef, PlayerColor } from "../../constants/app-constants";
import { loadState } from "../../store/localStorage";
import { GameType } from "../../game-modules/GameType";
import GameManager from "../../game-modules/GameModuleManager";

export interface ICustomGame {
  gameType: string;
  name: string;
  heroImageUrl: string;
}
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

export interface IChangelogEntry {
  version: string;
  message: string;
}

export interface IGameState {
  stageZoom: Vector2d;
  stagePosition: Vector2d;
  radialMenuPosition: Vector2d | null;
  specificCardLoaderPosition: Vector2d | null;
  deckSearchPosition: Vector2d | null;
  showCardPeekCards: number | null;
  playerColors: { [key: string]: PlayerColor };
  playerNumbers: { [key: string]: number };
  currentVisiblePlayerHandNumber: number | null; // If null, view your own hand
  peerId: string;
  multiplayerGameName: string;
  previewCard: IPreviewCard | null;
  menuPreviewCardJsonId: string | null;
  rotatePreviewCard180: boolean;
  activeGameType: GameType | null;
  draggingCardFromHand: boolean;
  drawCardsIntoHand: boolean;
  snapCardsToGrid: boolean;
  drawingArrow: boolean;
  searchingForOnlineDecks: boolean;
  mostRecentOnlineDeckSearchResults: OnlineDeckDataMap;
  allJsonDataLoaded: boolean;
  showDeckTextImporterWithPosition: Vector2d | null;
  customGames: ICustomGame[];
  showFullHandUI: boolean;
  mostRecentChangelog: IChangelogEntry[] | null;
  showChangelog: boolean;
  undoing: boolean;
  remoteUndoing: boolean;
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
localStorageState.multiplayerGameName = "";
localStorageState.previewCard = null;
localStorageState.menuPreviewCardJsonId = null;
localStorageState.rotatePreviewCard180 = false;
localStorageState.radialMenuPosition = null;
localStorageState.specificCardLoaderPosition = null;
localStorageState.deckSearchPosition = null;
localStorageState.showCardPeekCards = null;
localStorageState.draggingCardFromHand = false;
localStorageState.drawingArrow = false;
localStorageState.searchingForOnlineDecks = false;
localStorageState.mostRecentOnlineDeckSearchResults = {};
localStorageState.allJsonDataLoaded = false;
localStorageState.showDeckTextImporterWithPosition = null;
localStorageState.mostRecentChangelog = null;
localStorageState.showChangelog = false;
localStorageState.undoing = false;
localStorageState.remoteUndoing = false;

// Register any custom games we have previously loaded

// Note, we have to do this here because we need
// the custom modules registered before any content is rendered
if (localStorageState.customGames) {
  localStorageState.customGames.forEach((cg) =>
    GameManager.registerCustomModule(cg.gameType)
  );
}

const defaultState: IGameState = {
  playerColors: {},
  playerNumbers: {},
  stageZoom: { x: 0.5, y: 0.5 },
  stagePosition: { x: 0, y: 0 },
  peerId: "",
  multiplayerGameName: "",
  previewCard: null,
  menuPreviewCardJsonId: null,
  rotatePreviewCard180: false,
  activeGameType: null,
  radialMenuPosition: null,
  specificCardLoaderPosition: null,
  deckSearchPosition: null,
  showCardPeekCards: null,
  draggingCardFromHand: false,
  drawCardsIntoHand: true,
  snapCardsToGrid: true,
  currentVisiblePlayerHandNumber: null,
  drawingArrow: false,
  searchingForOnlineDecks: false,
  mostRecentOnlineDeckSearchResults: {},
  allJsonDataLoaded: false,
  showDeckTextImporterWithPosition: null,
  customGames: [],
  showFullHandUI: false,
  mostRecentChangelog: null,
  showChangelog: false,
  undoing: false,
  remoteUndoing: false,
};
export const initialState: IGameState = {
  ...defaultState,
  ...localStorageState,
};
