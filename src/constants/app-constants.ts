import { v4 as uuidv4 } from "uuid";

export const myPeerRef = uuidv4();

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
  "cyan",
  "green",
  "blue",
  "magenta",
  "yellow",
];
