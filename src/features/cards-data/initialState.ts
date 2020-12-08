import { CardData } from "../../external-api/marvel-card-data";

export interface ICardData {
  [key: string]: CardData;
}

export interface Set {
  name: string;
  setTypeCode: string;
}

export interface ISetData {
  [key: string]: Set;
}

export interface ICardsDataState {
  entities: ICardData;
  encounterEntities: ICardData;
  setData: ISetData;
}

export const initialState: ICardsDataState = {
  entities: {},
  encounterEntities: {},
  setData: {},
};
