import { Vector2d } from "konva/lib/types";
import { CounterTokenType, StatusTokenType } from "../constants/card-constants";
import { CardData } from "../external-api/common-card-data";
import { ICardData, ISetData } from "../features/cards-data/initialState";
import { ICardDetails } from "../features/cards/initialState";
import { AxiosResponse } from "axios";
import { RootState } from "../store/rootReducer";
import { IEncounterEntity } from "../features/cards-data/cards-data.selectors";

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

export type CodeToImageMap = { [key: string]: string };

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
  extraCards: ExtraCards;
  remappedPacks: CardPackRemapping;

  constructor(
    properties: GameProperties,
    imageMap: CodeToImageMap,
    extraCards: ExtraCards,
    remappedPacks: CardPackRemapping
  ) {
    this.properties = properties;
    this.imageMap = imageMap;
    this.extraCards = extraCards;
    this.remappedPacks = remappedPacks;
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
}

export enum GameType {
  MarvelChampions = "marvelchampions",
  LordOfTheRingsLivingCardGame = "lotrlcg",
}
