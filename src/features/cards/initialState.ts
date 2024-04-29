import { loadState } from "../../store/localStorage";
import {
  CardSizeType,
  CounterTokenType,
  StatusTokenType,
} from "../../constants/card-constants";
import JSONCrush from "jsoncrush";
import { Vector2d } from "konva/lib/types";
import { GameType } from "../../game-modules/GameType";

export interface CardtableJSONDeck {
  gameTypeForDeck: GameType;
  // Deprecated
  cardsInStack?: string[];
  // Use this one
  stacks?: string[][];
}

export interface IPlayerHandCard {
  faceup: boolean;
  cardDetails: ICardDetails;
}
export interface IPlayerHand {
  role: string | null;
  cards: IPlayerHandCard[];
}

export interface IPlayerBoardSlotLocation {
  boardId: string;
  pos: Vector2d;
  landscape: boolean;
}

export interface IDropTarget {
  cardStack?: ICardStack;
  playerBoardSlot?: IPlayerBoardSlotLocation;
}

export interface ICardStack {
  controlledBy: string;
  dragging: boolean;
  shuffling: boolean;
  exhausted: boolean;
  faceup: boolean;
  fill: string;
  id: string;
  selected: boolean;
  x: number;
  y: number;
  cardStack: ICardDetails[];
  statusTokens: {
    [K in StatusTokenType]: number;
  };
  counterTokens: {
    [K in CounterTokenType]: number;
  };
  modifiers: {
    [K: string]: number;
  };
  extraIcons: string[];
  attachedTo?: string | null;
  attachedCardIds?: string[] | null;
  sizeType: CardSizeType;
  topCardFaceup: boolean;
}

export interface ICardSlot {
  relativeX: number;
  relativeY: number;
  landscape: boolean;
}

export interface IPlayerBoard {
  id: string;
  code: string;
  x: number;
  y: number;
  height: number;
  width: number;
  cardSlots: ICardSlot[];
  locked: boolean;
  image: string;
  attachedStackIds: string[];
}

export interface IPlayerBoardOptional {
  id?: string;
  code?: string;
  x?: number;
  y?: number;
  height?: number;
  width?: number;
  cardSlots?: ICardSlot[];
  locked?: boolean;
  image?: string;
  attachedStackIds?: string[];
}

export const DEFAULT_PLAYER_BOARD: IPlayerBoard = {
  id: "",
  code: "",
  x: 0,
  y: 0,
  height: 0,
  width: 0,
  cardSlots: [],
  locked: false,
  image: "",
  attachedStackIds: [],
};

export interface ICardDetails {
  jsonId: string;
}

export interface ICardsState {
  outOfSyncWithRemoteCount: number;
  cards: ICardStack[];
  ghostCards: ICardStack[];
  playerHands: IPlayerHand[];
  playerBoards: IPlayerBoard[];
  tableCardSlots: ICardSlot[];
  dropTargetCards: { [key: string]: IDropTarget | null };
  attachTargetCards: { [key: string]: ICardStack | null };
  panMode: boolean;
  multiselectMode: boolean;
}

export const MAX_PLAYERS = 6;

export const generateDefaultPlayerHands = (): IPlayerHand[] =>
  Array(MAX_PLAYERS).fill({ cards: [], role: null });

const queryParams = new URLSearchParams(window.location.search);

const queryParamsHandsString = queryParams.get("hands");
let queryParamsHands = !!queryParamsHandsString
  ? JSON.parse(JSONCrush.uncrush(queryParamsHandsString))
  : null;

// const queryParamsHandsString = queryParams.get("hands");
// const queryParamsHands = !!queryParamsHandsString
//   ? JSON.parse(JSONCrush.uncrush(queryParamsHandsString))
//   : null;

const queryParamsCardsString = queryParams.get("cards");
const queryParamsCards = !!queryParamsCardsString
  ? { cards: JSON.parse(JSONCrush.uncrush(queryParamsCardsString)) }
  : null;

if (queryParamsCards && queryParamsHands) {
  (queryParamsCards as any).playerHands = queryParamsHands;
}

const localStorageState: ICardsState =
  queryParamsCards || (loadState("liveState")?.cards ?? {});

// Fix up new / old player hands format
if (!!localStorageState.playerHands) {
  localStorageState.playerHands.forEach((hand) => {
    if (!!hand.cards && hand.cards.length > 0) {
      hand.cards.forEach((handCard) => {
        if (!!(handCard as any).jsonId) {
          handCard.faceup = true;
          handCard.cardDetails = { jsonId: (handCard as any).jsonId };
          delete (handCard as any).jsonId;
        }
      });
    }
  });
}

// Make sure initially, none of the cards are "owned" / "selected" / "shuffling"
if (!!localStorageState.cards) {
  localStorageState.cards.forEach((c) => {
    c.controlledBy = "";
    c.selected = false;
    c.shuffling = false;

    // handle missing modifiers
    if (!c.modifiers) {
      c.modifiers = {};
    }

    if (!c.topCardFaceup) {
      c.topCardFaceup = false;
    }

    // handle missing possibleIcons
    if (!c.extraIcons) {
      c.extraIcons = [];
    }

    // handle any boolean status tokens
    if ((c.statusTokens.stunned as unknown as boolean) === false) {
      c.statusTokens.stunned = 0;
    } else if ((c.statusTokens.stunned as unknown as boolean) === true) {
      c.statusTokens.stunned = 1;
    }

    if ((c.statusTokens.confused as unknown as boolean) === false) {
      c.statusTokens.confused = 0;
    } else if ((c.statusTokens.confused as unknown as boolean) === true) {
      c.statusTokens.confused = 1;
    }

    if ((c.statusTokens.tough as unknown as boolean) === false) {
      c.statusTokens.tough = 0;
    } else if ((c.statusTokens.tough as unknown as boolean) === true) {
      c.statusTokens.tough = 1;
    }

    // handle missing size type
    if (!c.sizeType) {
      c.sizeType = CardSizeType.Standard;
    }
  });
}

localStorageState.attachTargetCards = {};
localStorageState.dropTargetCards = {};
localStorageState.ghostCards = [];
localStorageState.outOfSyncWithRemoteCount = 0;

const defaultState: ICardsState = {
  outOfSyncWithRemoteCount: 0,
  cards: [],
  playerBoards: [],
  tableCardSlots: [],
  ghostCards: [],
  dropTargetCards: {},
  attachTargetCards: {},
  panMode: true,
  multiselectMode: false,
  playerHands: generateDefaultPlayerHands(),
};

export const initialState: ICardsState = {
  ...defaultState,
  ...localStorageState,
  // ...{
  //   tableCardSlots: [
  //     { landscape: false, relativeX: 143, relativeY: 205 },
  //     { landscape: false, relativeX: 315, relativeY: 205 },
  //     { landscape: false, relativeX: 492, relativeY: 205 },
  //     { landscape: false, relativeX: 1220, relativeY: 202 },
  //     { landscape: false, relativeX: 1399, relativeY: 201 },
  //     { landscape: false, relativeX: 143, relativeY: 485 },
  //     { landscape: false, relativeX: 315, relativeY: 485 },
  //     { landscape: false, relativeX: 1399, relativeY: 481 },
  //     { landscape: false, relativeX: 143, relativeY: 766 },
  //     { landscape: false, relativeX: 315, relativeY: 766 },
  //     { landscape: false, relativeX: 1399, relativeY: 762 },
  //     { landscape: false, relativeX: 1214, relativeY: 476 },
  //     { landscape: false, relativeX: 1033, relativeY: 476 },
  //     { landscape: false, relativeX: 858, relativeY: 476 },
  //     { landscape: false, relativeX: 681, relativeY: 476 },
  //     { landscape: false, relativeX: 502, relativeY: 476 },
  //     { landscape: false, relativeX: 1214, relativeY: 757 },
  //     { landscape: false, relativeX: 1033, relativeY: 757 },
  //     { landscape: false, relativeX: 858, relativeY: 757 },
  //     { landscape: false, relativeX: 681, relativeY: 757 },
  //     { landscape: false, relativeX: 502, relativeY: 757 },
  //   ],
  // },
  // ...{
  //   playerBoards: [
  //     {
  //       id: "this is some id",
  //       cardSlots: [
  //         { relativeX: 345, relativeY: 191, landscape: false },
  //         { relativeX: 139, relativeY: 221, landscape: true },
  //         { relativeX: 139, relativeY: 165, landscape: true },
  //         { relativeX: 139, relativeY: 125, landscape: true },
  //       ],
  //       code: "this is some code",
  //       image:
  //         "https://ik.imagekit.io/cardtable/star_wars_deckbuilding_game/solo_leaders/leaders_empire_ai_card.png",
  //       height: 350,
  //       width: 455,
  //       x: 0,
  //       y: 0,
  //       locked: false,
  //       attachedStackIds: [],
  //     },
  //   ],
  // },
};
