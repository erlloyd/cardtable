import { GameType } from "../../constants/app-constants";
import { CardData } from "../../external-api/common-card-data";

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
  activeDataType: GameType;
  data: { [key in GameType]?: IGameCardsDataState };
}
export interface IGameCardsDataState {
  entities: ICardData;
  encounterEntities: ICardData;
  setData: ISetData;
}

export const initialState: ICardsDataState = {
  activeDataType: GameType.MarvelChampions,
  data: {},
};
