export interface ICard {
  dragging: boolean;
  exhausted: boolean;
  faceup: boolean;
  fill: string;
  id: number;
  selected: boolean;
  x: number;
  y: number;
  cardStack: ICardDetails[];
}

export interface ICardDetails {
  id: number
}

export interface IPreviewCard {
  id: number;
}

export interface ICardsState {
  cards: ICard[];
  ghostCards: ICard[];
  previewCard: IPreviewCard | null;
  dropTargetCard: ICard | null;
  panMode: boolean;
}

export const initialState: ICardsState = {
  cards: [
    {
      dragging: false,
      exhausted: false,
      faceup: true,
      fill: 'red',
      id: 0,
      selected: false,
      x: 200,
      y: 200,
      cardStack: [],
    },
    {
      dragging: false,
      exhausted: false,
      faceup: true,
      fill: 'red',
      id: 1,
      selected: false,
      x: 400,
      y: 400,
      cardStack: [],
    },
    {
      dragging: false,
      exhausted: false,
      faceup: false,
      fill: 'red',
      id: 2,
      selected: false,
      x: 200,
      y: 600,
      cardStack: [],
    },
  ],
  ghostCards: [],
  previewCard: null,
  dropTargetCard: null,
  panMode: true,
};
