import { CardData } from "../../external-api/marvel-card-data";

export interface ICardData {
  [key: string]: CardData;
}

export interface ICardsDataState {
  entities: ICardData;
  encounterEntities: ICardData;
}

export const initialState: ICardsDataState = {
  entities: {},
  encounterEntities: {},
};
