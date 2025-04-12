import { v4 as uuidv4 } from "uuid";
import { GameType } from "../game-modules/GameType";
import { PayloadAction } from "@reduxjs/toolkit";
import { ISettings } from "../features/game/initialState";

// For multiplayer type
export const DEV_WS_LS_KEY = "__dev_ws__";
export const USE_WEBRTC_LS_KEY = "__webrtc_mp__";
export const SHOW_HIDDEN_GAMES_LS_KEY = "__show_hidden_games__";
export const useDevWSServerLocalStorage = !!localStorage.getItem(DEV_WS_LS_KEY);
export const useWebRTCLocalStorage = !!localStorage.getItem(USE_WEBRTC_LS_KEY);
export const showHiddenGamesLocalStorage = !!localStorage.getItem(
  SHOW_HIDDEN_GAMES_LS_KEY
);

// Peer ref
export const myPeerRef = uuidv4();
(window as any).myPeerRef = myPeerRef;

export const COLORS = {
  RED: "#e74c3c",
  BLUE: "#2980b9",
  GREEN: "#27ae60",
  TURQUOISE: "#1abc9c",
  PURPLE: "#8e44ad",
  YELLOW: "#f1c40f",
  ORANGE: "#e67e22",
  GRAY: "#95a5a6",
  WHITE: "white",
  BLACK: "black",
} as const;

export type PlayerColor = (typeof COLORS)[keyof typeof COLORS];

export const possibleColors: {
  label: string;
  color: PlayerColor;
}[] = [
  { label: "Red", color: COLORS.RED },
  { label: "Blue", color: COLORS.BLUE },
  { label: "Green", color: COLORS.GREEN },
  { label: "Turquoise", color: COLORS.TURQUOISE },
  { label: "Purple", color: COLORS.PURPLE },
  { label: "Yellow", color: COLORS.YELLOW },
  { label: "Orange", color: COLORS.ORANGE },
  { label: "Gray", color: COLORS.GRAY },
  { label: "White", color: COLORS.WHITE },
  { label: "Black", color: COLORS.BLACK },
];

const playerHandHeightPx: number = 90;

export const getPlayerHandHeightPx = (settings: ISettings): number => {
  return settings.hideHandUI ? 0 : playerHandHeightPx;
};

export const playerHandElementId: string = "card-table-player-hand-area";

export const defaultPlaymatWidth: number = 2880;

export const defaultPlaymatHeight: number = 1440;

export const MAX_RECENTLY_LOADED_DECKS: number = 10;

export type CardtableAction<T> =
  | PayloadAction<T> & { CURRENT_GAME_TYPE?: GameType; ACTOR_REF?: string };
