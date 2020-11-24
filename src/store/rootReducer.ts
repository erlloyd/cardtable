import { combineReducers } from "redux";
import cards from "../features/cards/cards.slice";
import cardsData from "../features/cards-data/cards-data.slice";
import game from "../features/game/game.slice";

const rootReducer = combineReducers({
  game,
  cards,
  cardsData,
});

export type RootState = ReturnType<typeof rootReducer>;

export default rootReducer;
