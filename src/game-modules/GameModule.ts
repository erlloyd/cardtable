import { Vector2d } from "konva/lib/types";
import {
  CardAttachLocation,
  CounterTokenType,
  StatusTokenType,
} from "../constants/card-constants";
import { CardData } from "../external-api/common-card-data";
import { ICardData, ISetData } from "../features/cards-data/initialState";
import {
  ICardDetails,
  ICardSlot,
  ICardStack,
  IPlayerBoard,
} from "../features/cards/initialState";
import { AxiosResponse } from "axios";
import { RootState } from "../store/rootReducer";
import {
  ICardSetToLoad,
  IEncounterEntity,
} from "../features/cards-data/cards-data.selectors";
import { GameType } from "./GameType";
import { ICounter, IFlippableToken } from "../features/counters/initialState";
import { PlayerColor } from "../constants/app-constants";
import { ContextMenuItem } from "../ContextMenu";

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
  overridePosition?: Vector2d;
}
export interface NumericTokenInfo extends TokenInfoBase {
  isNumeric: boolean;
  counterTokenType: CounterTokenType;
  singleOnly?: boolean;
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

export interface TokensInfo {
  stunned: TokenInfo | null;
  confused: TokenInfo | null;
  tough: TokenInfo | null;
  damage: NumericTokenInfo | null;
  threat: NumericTokenInfo | null;
  generic: NumericTokenInfo | null;
  acceleration: NumericTokenInfo | null;
}

export interface IPlaymatOption {
  displayName: string;
  imgUrl: string;
}

export type AdditionalResource = { url: string; display: string };

export type IPlaymatLayout = "row" | "column" | "ebr";

export interface GameProperties {
  heroImageUrl: string;
  deckSite: string;
  decklistApi: string;
  allowSpecificCardSearch?: boolean;
  privateDecklistApi?: string;
  decklistSearchApi: string;
  decklistSearchApiConstants?: string;
  encounterUiName: string;
  initialPlaymatImageLocation: string;
  customPlaymatWidth?: number;
  additionalPlaymatImageOptions?: {
    layout: IPlaymatLayout;
    additionalImages: IPlaymatOption[];
  };
  possibleIcons: IconInfo[];
  modifiers: ModifierInfo[];
  roles?: RolesInfo;
  tokens: TokensInfo;
  iconCounters?: IconCounter[];
  textCounters?: TextCounter[];
  useAltCardArtByDefault?: boolean;
  defaultAttachLocation: CardAttachLocation;
  tableCardSlots?: ICardSlot[];
  additionalResourcesUris?: AdditionalResource[];
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
    encounterEntities: ICardData,
    customCards?: boolean
  ): IEncounterEntity[];

  getCustomLoadSetsFromState(
    setData: ISetData,
    herosData: ICardData,
    encounterEntities: ICardData
  ): ICardSetToLoad[] {
    const filteredSetData = {} as ISetData;
    Object.values(herosData).forEach((v) => {
      if (v.customCard) {
        const setForCard = setData[v.extraInfo.setCode ?? "unknown"];
        if (!setForCard) {
          console.error(`Could not find set for card ${v.name} (${v.code})`);
        } else {
          filteredSetData[setForCard.name] = filteredSetData[
            setForCard.name
          ] ?? { ...setForCard };

          filteredSetData[setForCard.name].cardsInSet = filteredSetData[
            setForCard.name
          ].cardsInSet.concat([{ code: v.code, quantity: v.quantity }]);
        }
      }
    });

    Object.values(encounterEntities).forEach((v) => {
      if (v.customCard) {
        const setForCard = setData[v.extraInfo.setCode ?? "unknown"];
        if (!setForCard) {
          console.error(`Could not find set for card ${v.name} (${v.code})`);
        } else {
          filteredSetData[setForCard.name] = filteredSetData[
            setForCard.name
          ] ?? { ...setForCard };

          filteredSetData[setForCard.name].cardsInSet = filteredSetData[
            setForCard.name
          ].cardsInSet.concat([{ code: v.code, quantity: v.quantity }]);
        }
      }
    });

    const setDataToReturn = Object.entries(filteredSetData).map(
      ([key, value]) => {
        const encounterEntity: IEncounterEntity = {
          setCode: key,
          setData: value,
          cards: value.cardsInSet.map((cis) => encounterEntities[cis.code]),
        };

        return encounterEntity;
      }
    );

    // Go through and get the original index of every "type" of set
    const originalOrder = setDataToReturn.reduce((orderMap, entity, index) => {
      if (!orderMap[entity.setData.setTypeCode]) {
        orderMap[entity.setData.setTypeCode] = index;
      }

      return orderMap;
    }, {} as { [key: string]: number });

    return setDataToReturn.sort(
      (a, b) =>
        originalOrder[a.setData.setTypeCode] -
        originalOrder[b.setData.setTypeCode]
    );
  }

  additionalRotationForCardForRole(
    _role: string,
    _code: string,
    _faceup: boolean,
    _typeCode?: string
  ): number {
    return 0;
  }

  isCardBackImg(imgUrl: string): boolean {
    return imgUrl.indexOf("_back") !== -1;
  }

  loadDeckFromText?(text: string): string[][];

  splitEncounterCardsIntoStacksWhenLoading?(
    setCode: string,
    encounterCards: CardData[]
  ): CardData[][];
  getTokensForEncounterSet?(setCode: string): IFlippableToken[];
  getCountersForEncounterSet?(setCode: string): ICounter[];
  getPlayerBoardsForEncounterSet?(setCode: string): IPlayerBoard[];
  shouldRotateCard?(code: string, type: string, faceup: boolean): boolean;
  getCustomTokenInfoForCard?(
    card: ICardStack,
    cardType: string,
    defaultTokenInfo: TokensInfo
  ): TokensInfo | null;
  getTableCardSlots?(numPlaymats: number): ICardSlot[] | undefined;
  async loadDecklistFromAPI?(id: number): Promise<any>;
}
