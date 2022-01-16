import { loadState } from "../../store/localStorage";
import {
  CounterTokenType,
  StatusTokenType,
} from "../../constants/card-constants";
import JSONCrush from "jsoncrush";

export interface IPlayerHand {
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
    [K in StatusTokenType]: boolean;
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
}

export interface ICardDetails {
  jsonId: string;
}

export interface ICardsState {
  outOfSyncWithRemote: boolean;
  cards: ICardStack[];
  ghostCards: ICardStack[];
  playerHands: IPlayerHand[];
  dropTargetCards: { [key: string]: ICardStack | null };
  attachTargetCards: { [key: string]: ICardStack | null };
  panMode: boolean;
  multiselectMode: boolean;
}

const MAX_PLAYERS = 4;

export const generateDefaultPlayerHands = (): IPlayerHand[] =>
  Array(MAX_PLAYERS).fill({ cards: [] });

const queryParams = new URLSearchParams(window.location.search);
const queryParamsCardsString = queryParams.get("cards");
const queryParamsCards = !!queryParamsCardsString
  ? { cards: JSON.parse(JSONCrush.uncrush(queryParamsCardsString)) }
  : null;

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
  });
}

localStorageState.attachTargetCards = {};
localStorageState.dropTargetCards = {};
localStorageState.ghostCards = [];
localStorageState.outOfSyncWithRemote = false;

const defaultState: ICardsState = {
  outOfSyncWithRemote: false,
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
