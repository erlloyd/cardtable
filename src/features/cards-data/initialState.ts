import { GameType } from "../../constants/app-constants";
import { CardData } from "../../external-api/common-card-data";
import { loadState } from "../../store/localStorage";
import { IGameState } from "../game/initialState";

export interface ICardData {
  [key: string]: CardData;
}

export interface CardInSet {
  code: string;
  quantity: number;
}

export interface Set {
  name: string;
  setTypeCode: string;
  cardsInSet: CardInSet[];
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

const localGameState: IGameState = loadState("game");

export const initialState: ICardsDataState = {
  activeDataType: localGameState.activeGameType ?? GameType.MarvelChampions,
  data: {},
};
