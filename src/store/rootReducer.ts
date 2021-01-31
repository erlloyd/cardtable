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

const undoableState = combineReducers({
  counters,
  cards,
});

const rootReducer = combineReducers({
  game,
  cardsData,
  liveState: undoable(undoableState, {
    limit: 20,
    groupBy: groupByActionTypes([moveCounter.type]),
    filter: excludeAction([
      startCardMoveWithSplitStackId.type,
      cardMove.type,
      hoverCard.type,
      hoverLeaveCard.type,
    ]),
  }),
});

export type RootState = ReturnType<typeof rootReducer>;

export default rootReducer;
