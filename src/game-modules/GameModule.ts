import { Vector2d } from "konva/lib/types";
import { CounterTokenType, StatusTokenType } from "../constants/card-constants";
import { CardData } from "../external-api/common-card-data";
import { ICardData, ISetData } from "../features/cards-data/initialState";
import { ICardDetails } from "../features/cards/initialState";
import { AxiosResponse } from "axios";
import { RootState } from "../store/rootReducer";
import { IEncounterEntity } from "../features/cards-data/cards-data.selectors";
import { GameType } from "./GameType";
import { ICounter, IFlippableToken } from "../features/counters/initialState";
import { PlayerColor } from "../constants/app-constants";

export type CardPackRemapping = { [key: string]: string };

export type ExtraCards = { [key: string]: ICardDetails[] };
export interface ILoadedDeck {
  position: Vector2d;
  heroId: string;
  data: IDeckData;
  dataId: string;
  extraHeroCards: ICardDetails[];
  relatedEncounterDeck: string[];
  encounterDeckId: string;
  relatedObligationDeck: string[];
  obligationDeckId: string;
}

export interface IDeckData {
  slots: { [key: string]: number };
}

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

export type StringToStringMap = { [key: string]: string };
export type StringToStringArrayMap = { [key: string]: string[] };

export interface IconCounter {
  counterName: string;
  counterImage: string;
  counterColor?: PlayerColor;
}

export interface TextCounter {
  counterName: string;
  counterText: string;
  counterColor?: PlayerColor;
}

export interface Role {
  name: string;
}

export interface RolesInfo {
  requireRole?: boolean;
  roles: Role[];
}

export interface GameProperties {
  deckSite: string;
  decklistApi: string;
  privateDecklistApi?: string;
  decklistSearchApi: string;
  decklistSearchApiConstants?: string;
  encounterUiName: string;
  backgroundImageLocation: string;
  possibleIcons: IconInfo[];
  modifiers: ModifierInfo[];
  roles?: RolesInfo;
  tokens: {
    stunned: TokenInfo | null;
    confused: TokenInfo | null;
    tough: TokenInfo | null;
    damage: NumericTokenInfo | null;
    threat: NumericTokenInfo | null;
    generic: NumericTokenInfo | null;
    acceleration: NumericTokenInfo | null;
  };
  iconCounters?: IconCounter[];
  textCounters?: TextCounter[];
}
export abstract class GameModule {
  properties: GameProperties;
  imageMap: StringToStringMap;
  extraCards: ExtraCards;
  remappedPacks: CardPackRemapping;
  horizontalTypeCodes: string[];

  constructor(
    properties: GameProperties,
    imageMap: StringToStringMap,
    extraCards: ExtraCards,
    remappedPacks: CardPackRemapping,
    horizontalTypeCodes: string[]
  ) {
    this.properties = properties;
    this.imageMap = imageMap;
    this.extraCards = extraCards;
    this.remappedPacks = remappedPacks;
    this.horizontalTypeCodes = horizontalTypeCodes;
  }

  abstract getSetData(): ISetData;
  abstract getCardsData(): Promise<ILoadCardsData[]>;
  abstract getEncounterSetData(): Promise<ILoadEncounterSetData[]>;

  abstract checkIsPlayerPack(packCode: string): boolean;
  abstract convertCardDataToCommonFormat(packWithMetadata: {
    pack: any;
    metadata: IPackMetadata;
  }): CardData[];

  abstract parseDecklist(
    response: AxiosResponse<any, any>,
    state: RootState,
    payload: {
      gameType: GameType;
      decklistId: number;
      position: Vector2d;
    }
  ): [string[], ILoadedDeck];

  abstract getEncounterEntitiesFromState(
    setData: ISetData,
    herosData: ICardData,
    encounterEntities: ICardData
  ): IEncounterEntity[];

  additionalRotationForCardForRole(
    _role: string,
    _code: string,
    _faceup: boolean,
    _typeCode?: string
  ): number {
    return 0;
  }

  splitEncounterCardsIntoStacksWhenLoading?(
    setCode: string,
    encounterCards: CardData[]
  ): CardData[][];
  getTokensForEncounterSet?(setCode: string): IFlippableToken[];
  getCountersForEncounterSet?(setCode: string): ICounter[];
}
