import { loadState } from "../../store/localStorage";
import {
  CardSizeType,
  CounterTokenType,
  StatusTokenType,
} from "../../constants/card-constants";
import JSONCrush from "jsoncrush";

export interface IPlayerHand {
  role: string | null;
  cards: ICardDetails[];
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
}

export interface ICardDetails {
  jsonId: string;
}

export interface ICardsState {
  outOfSyncWithRemoteCount: number;
  cards: ICardStack[];
  ghostCards: ICardStack[];
  playerHands: IPlayerHand[];
  dropTargetCards: { [key: string]: ICardStack | null };
  attachTargetCards: { [key: string]: ICardStack | null };
  panMode: boolean;
  multiselectMode: boolean;
}

export const MAX_PLAYERS = 6;

export const generateDefaultPlayerHands = (): IPlayerHand[] =>
  Array(MAX_PLAYERS).fill({ cards: [], role: null });

const queryParams = new URLSearchParams(window.location.search);

const queryParamsHandsString = queryParams.get("hands");
const queryParamsHands = !!queryParamsHandsString
  ? JSON.parse(JSONCrush.uncrush(queryParamsHandsString))
  : null;

const queryParamsCardsString = queryParams.get("cards");
const queryParamsCards = !!queryParamsCardsString
  ? { cards: JSON.parse(JSONCrush.uncrush(queryParamsCardsString)) }
  : null;

if (queryParamsCards && queryParamsHands) {
  (queryParamsCards as any).playerHands = queryParamsHands;
}

const localStorageState: ICardsState =
  queryParamsCards || (loadState("liveState")?.cards ?? {});

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
};
