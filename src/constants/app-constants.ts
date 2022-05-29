import { v4 as uuidv4 } from "uuid";

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
