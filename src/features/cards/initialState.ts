export interface ICard {
  dragging: boolean;
  exhausted: boolean;
  fill: string;
  id: number;
  selected: boolean;
  x: number;
  y: number;
}

export interface ICardsState {
  cards: ICard[];
}

const state: ICardsState = {
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
      x: 400,
      y: 600
    },
  ]
}; 

export default state;