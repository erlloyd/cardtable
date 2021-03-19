import { loadState } from "../../store/localStorage";
import {
  CounterTokenType,
  StatusTokenType,
} from "../../constants/card-constants";
import * as jc from "jsoncrush";

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
}

export interface ICardDetails {
  jsonId: string;
}

export interface ICardsState {
  cards: ICardStack[];
  ghostCards: ICardStack[];
  dropTargetCards: { [key: string]: ICardStack | null };
  attachTargetCards: { [key: string]: ICardStack | null };
  panMode: boolean;
}

const queryParams = new URLSearchParams(window.location.search);
const queryParamsCardsString = queryParams.get("cards");
const queryParamsCards = !!queryParamsCardsString
  ? { cards: JSON.parse(jc.JSONUncrush(queryParamsCardsString)) }
  : null;

const localStorageState: ICardsState =
  queryParamsCards || (loadState("liveState")?.cards ?? {});

// Make sure initially, none of the cards are "owned" / "selected" / "shuffling"
if (!!localStorageState.cards) {
  localStorageState.cards.forEach((c) => {
    c.controlledBy = "";
    c.selected = false;
    c.shuffling = false;
  });
}

localStorageState.attachTargetCards = {};
localStorageState.dropTargetCards = {};
localStorageState.ghostCards = [];

const defaultState: ICardsState = {
  cards: [],
  ghostCards: [],
  dropTargetCards: {},
  attachTargetCards: {},
  panMode: true,
};

export const initialState: ICardsState = {
  ...defaultState,
  ...localStorageState,
};
