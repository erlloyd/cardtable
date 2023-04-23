import { CounterTokenType, StatusTokenType } from "../constants/card-constants";
import { CardData } from "../external-api/common-card-data";
import { ISetData } from "../features/cards-data/initialState";

export interface IPackMetadata {
  setType: string;
  encounterPack: boolean;
}

export interface ILoadCardsData {
  packType: GameType;
  pack: any;
  pack_code: string;
}

export interface ILoadEncounterSetData {
  gameType: GameType;
  setCode: string;
  cards: any[];
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

  abstract getSetData(): ISetData;
  abstract getCardsData(): Promise<ILoadCardsData[]>;
  abstract getEncounterSetData(): Promise<ILoadEncounterSetData[]>;

  abstract checkIsPlayerPack(packCode: string): boolean;
  abstract convertCardDataToCommonFormat(packWithMetadata: {
    pack: any;
    metadata: IPackMetadata;
  }): CardData[];
}

export enum GameType {
  MarvelChampions = "marvelchampions",
  LordOfTheRingsLivingCardGame = "lotrlcg",
}
