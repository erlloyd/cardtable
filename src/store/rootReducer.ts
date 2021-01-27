import { combineReducers } from "redux";
import undoable, { excludeAction, groupByActionTypes } from "redux-undo";
import cardsData from "../features/cards-data/cards-data.slice";
import { startCardMoveWithSplitStackId } from "../features/cards/cards.actions";
import cards, {
  cardMove,
  hoverCard,
  hoverLeaveCard,
} from "../features/cards/cards.slice";
import game from "../features/game/game.slice";

import counters, { moveCounter } from "../features/counters/counters.slice";

const rootReducer = combineReducers({
  game,
  counters: undoable(counters, {
    limit: 20,
    groupBy: groupByActionTypes([moveCounter.type]),
  }),
  cards: undoable(cards, {
    limit: 20,
    filter: excludeAction([
      startCardMoveWithSplitStackId.type,
      cardMove.type,
      hoverCard.type,
      hoverLeaveCard.type,
    ]),
  }),
  cardsData,
});

export type RootState = ReturnType<typeof rootReducer>;

export default rootReducer;
