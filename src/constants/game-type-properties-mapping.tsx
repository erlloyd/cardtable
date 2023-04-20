import { GameType } from "../game-modules/GameModule";
import { CounterTokenType, StatusTokenType } from "../constants/card-constants";
import GameManager from "../game-modules/GameModuleManager";

export interface GameProperties {
  deckSite: string;
  decklistApi: string;
  decklistSearchApi: string;
  decklistSearchApiConstants?: string;
  encounterUiName: string;
  backgroundImageLocation: string;
  possibleIcons: IconInfo[];
  modifiers: ModifierInfo[];
  tokens: {
    stunned: TokenInfo | null;
    confused: TokenInfo | null;
    tough: TokenInfo | null;
    damage: NumericTokenInfo | null;
    threat: NumericTokenInfo | null;
    generic: NumericTokenInfo | null;
  };
}

export interface TokenInfoBase {
  touchMenuLetter: string | null;
  menuText: string;
  imagePath: string;
}
export interface NumericTokenInfo extends TokenInfoBase {
  isNumeric: boolean;
  counterTokenType: CounterTokenType;
}

export interface TokenInfo extends TokenInfoBase {
  canStackMultiple: boolean;
  menuRemoveText: string;
  tokenType: StatusTokenType;
}

export interface ModifierInfo {
  attributeId: string;
  attributeName: string;
  icon: string;
  slot: number;
}

export interface IconInfo {
  iconId: string;
  iconName: string;
  iconImageUrl: string;
}

// TODO: Have all the callers go directly to GameManager at some point in the future
export const GamePropertiesMap: { [key in GameType]: GameProperties } =
  GameManager.properties;
