import { loadState } from "../../store/localStorage";
import { CounterTokenType, StatusTokenType } from "./cards.slice";

export interface ICardStack {
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
  dropTargetCard: ICardStack | null;
  panMode: boolean;
}

const localStorageState = loadState("cards");
const defaultState: ICardsState = {
  cards: [],
  ghostCards: [],
  previewCard: null,
  dropTargetCard: null,
  panMode: true,
};

export const initialState: ICardsState = {
  ...defaultState,
  ...localStorageState,
};
