export interface ICard {
  dragging: boolean;
  exhausted: boolean;
  fill: string;
  id: number;
  selected: boolean;
  x: number;
  y: number;
}

export interface IPreviewCard {
  id: number;
}

export interface ICardsState {
  cards: ICard[];
  ghostCards: ICard[];
  previewCard: IPreviewCard | null;
  panMode: boolean;
}

export const initialState: ICardsState = {
  cards: [
    {
      dragging: false,
      exhausted: false,
      fill: 'red',
      id: 0,
      selected: false,
      x: 200,
      y: 200
    },
    {
      dragging: false,
      exhausted: false,
      fill: 'red',
      id: 1,
      selected: false,
      x: 400,
      y: 400
    },
    {
      dragging: false,
      exhausted: false,
      fill: 'red',
      id: 2,
      selected: false,
      x: 200,
      y: 600
    },
  ],
  ghostCards: [],
  previewCard: null,
  panMode: true,
};
