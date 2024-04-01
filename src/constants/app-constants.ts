import { v4 as uuidv4 } from "uuid";

// For multiplayer type
export const DEV_WS_LS_KEY = "__dev_ws__";
export const USE_WEBRTC_LS_KEY = "__webrtc_mp__";
export const SHOW_HIDDEN_GAMES_LS_KEY = "__show_hidden_games__";
export const SHOW_CUSTOM_GAMES_LS_KEY = "__show_custom_games__";
export const useDevWSServerLocalStorage = !!localStorage.getItem(DEV_WS_LS_KEY);
export const useWebRTCLocalStorage = !!localStorage.getItem(USE_WEBRTC_LS_KEY);
export const showHiddenGamesLocalStorage = !!localStorage.getItem(
  SHOW_HIDDEN_GAMES_LS_KEY
);
export const showCustomGamesLocalStorage = !!localStorage.getItem(
  SHOW_CUSTOM_GAMES_LS_KEY
);

// Peer ref (for webrtc mode)
export const myPeerRef = uuidv4();
(window as any).myPeerRef = myPeerRef;

export type PlayerColor =
  | "red"
  | "cyan"
  | "green"
  | "blue"
  | "magenta"
  | "yellow";

export const possibleColors: PlayerColor[] = [
  "red",
  "blue",
  "green",
  "cyan",
  "magenta",
  "yellow",
];

export const playerHandHeightPx: number = 90;

export const playerHandElementId: string = "card-table-player-hand-area";

export const defaultPlaymatWidth: number = 2880;

export const defaultPlaymatHeight: number = 1440;
