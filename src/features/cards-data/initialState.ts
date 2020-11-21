import { CardData } from "../../external-api/marvel-card-data";

export interface ICardData {
  [key: string]: CardData;
}

export interface ICardsDataState {
  entities: ICardData;
}

export const initialState: ICardsDataState = {
  entities: {},
};
