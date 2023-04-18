import { CounterTokenType, StatusTokenType } from "../constants/card-constants";

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

export interface IconInfo {
  iconId: string;
  iconName: string;
  iconImageUrl: string;
}

export interface ModifierInfo {
  attributeId: string;
  attributeName: string;
  icon: string;
  slot: number;
}

export type CodeToImageMap = { [key: string]: string };

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

export abstract class GameModule {
  properties: GameProperties;
  imageMap: CodeToImageMap;

  constructor(properties: GameProperties, imageMap: CodeToImageMap) {
    this.properties = properties;
    this.imageMap = imageMap;
  }
}
