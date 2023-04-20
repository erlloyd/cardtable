import { v4 as uuidv4 } from "uuid";

// For multiplayer type
export const DEV_WS_LS_KEY = "__dev_ws__";
export const USE_WS_LS_KEY = "__ws_mp__";
export const useDevWSServerLocalStorage = !!localStorage.getItem(DEV_WS_LS_KEY);
export const useWSLocalStorage = !!localStorage.getItem(USE_WS_LS_KEY);

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

export const playerHandHeightPx: number = 70;

export const playerHandElementId: string = "card-table-player-hand-area";
