import { loadState } from "../../store/localStorage";
import { CounterTokenType, StatusTokenType } from "./cards.slice";

export interface ICardStack {
  controlledBy: string;
  dragging: boolean;
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

export interface IPreviewCard {
  id: string;
}

export interface ICardsState {
  cards: ICardStack[];
  ghostCards: ICardStack[];
  previewCard: IPreviewCard | null;
  dropTargetCards: { [key: string]: ICardStack | null };
  panMode: boolean;
}

const localStorageState: ICardsState = loadState("liveState")?.cards ?? {};

// Make sure initially, none of the cards are "owned" / "selected"
if (!!localStorageState.cards) {
  localStorageState.cards.forEach((c) => {
    c.controlledBy = "";
    c.selected = false;
  });
}

const defaultState: ICardsState = {
  cards: [],
  ghostCards: [],
  previewCard: null,
  dropTargetCards: {},
  panMode: true,
};

export const initialState: ICardsState = {
  ...defaultState,
  ...localStorageState,
};
