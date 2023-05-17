import { GameType } from "../game-modules/GameType";
import GameManager from "../game-modules/GameModuleManager";
import { GameProperties } from "../game-modules/GameModule";

// TODO: Have all the callers go directly to GameManager at some point in the future
export const GamePropertiesMap: { [key in GameType]: GameProperties } =
  GameManager.properties;
