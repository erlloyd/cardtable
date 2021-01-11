import { combineReducers } from "redux";
import cards, {
  cardMove,
  hoverCard,
  hoverLeaveCard,
  startCardMove,
} from "../features/cards/cards.slice";
import cardsData from "../features/cards-data/cards-data.slice";
import game, {
  moveCounter,
  updatePosition,
  updateZoom,
} from "../features/game/game.slice";
import undoable, { excludeAction, groupByActionTypes } from "redux-undo";

const rootReducer = combineReducers({
  game: undoable(game, {
    limit: 20,
    groupBy: groupByActionTypes([moveCounter.type]),
    filter: excludeAction([updateZoom.type, updatePosition.type]),
  }),
  cards: undoable(cards, {
    limit: 20,
    filter: excludeAction([
      startCardMove.type,
      cardMove.type,
      hoverCard.type,
      hoverLeaveCard.type,
    ]),
  }),
  cardsData,
});

export type RootState = ReturnType<typeof rootReducer>;

export default rootReducer;
