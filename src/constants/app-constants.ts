import { v4 as uuidv4 } from "uuid";

export const myPeerRef = uuidv4();

export type PlayerColor =
  | "red"
  | "cyan"
  | "green"
  | "blue"
  | "magnenta"
  | "yellow";

export const possibleColors: PlayerColor[] = [
  "red",
  "cyan",
  "green",
  "blue",
  "magnenta",
  "yellow",
];
