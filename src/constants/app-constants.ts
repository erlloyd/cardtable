import { v4 as uuidv4 } from "uuid";

// For multiplayer type
export const useDevWSServer = localStorage.getItem("__dev_ws__");
export const useWS = localStorage.getItem("__ws_mp__");

// Peer ref (for webrtc mode)
export const myPeerRef = uuidv4();
(window as any).myPeerRef = myPeerRef;

export enum GameType {
  MarvelChampions = "marvelchampions",
  LordOfTheRingsLivingCardGame = "lotrlcg",
}

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
