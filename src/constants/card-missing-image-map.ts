import { StringToStringMap } from "../game-modules/GameModule";
import GameManager from "../game-modules/GameModuleManager";
import { GameType } from "../game-modules/GameType";

export const CARD_SHOULD_BE_HORIZONTAL_MAP: { [key: string]: boolean } = {
  "42001c": true,
};

export const CARD_ALREADY_ROTATED_MAP: { [key: string]: boolean } = {
  "05026": true,
  "30025": true,
  "31026": true,
};

export const FORCE_ENCOUNTER_CARD_BACK_MAP: { [key: string]: boolean } = {
  "27175": true,
  "27181": true,
};

export const FORCE_CARD_BACK_MAP: { [key: string]: string } = {
  "305145": "https://s3.amazonaws.com/hallofbeorn-resources/Images/Cards/Mustering-of-the-Rohirrim/Osbera-SideB.png",
};

export const MISSING_CARD_IMAGE_MAP: { [key in GameType]: StringToStringMap } = GameManager.cardImageMap;
