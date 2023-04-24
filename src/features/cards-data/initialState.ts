import { GameType } from "../../game-modules/GameModule";
import { CardData } from "../../external-api/common-card-data";
import { loadState } from "../../store/localStorage";
import { IGameState } from "../game/initialState";
import GameManager from "../../game-modules/GameModuleManager";

export interface ICardData {
  [key: string]: CardData;
}
export interface ICardDataStored {
  [key: string]: CardData[];
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

export interface ICardsDataStateUserView {
  activeDataType: GameType;
  data: { [key in GameType]?: IGameCardsDataState };
}
export interface ICardsDataState {
  activeDataType: GameType;
  data: { [key in GameType]?: IGameCardsDataStateStored };
}
export interface IGameCardsDataState {
  entities: ICardData;
  encounterEntities: ICardData;
  setData: ISetData;
}

export interface IGameCardsDataStateStored {
  entities: ICardDataStored;
  encounterEntities: ICardDataStored;
  setData: ISetData;
}

const queryParams = new URLSearchParams(window.location.search);
const queryParamsGameType = queryParams.get("gameType");

const localGameState: IGameState = loadState("game");

const gameType = queryParamsGameType ?? localGameState.activeGameType;

export const initialState: ICardsDataState = {
  activeDataType:
    (gameType as GameType) ?? GameManager.allRegisteredGameTypes[0],
  data: {},
};
