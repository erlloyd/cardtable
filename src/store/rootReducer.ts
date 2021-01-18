import { combineReducers } from "redux";
import undoable, { excludeAction, groupByActionTypes } from "redux-undo";
import cardsData from "../features/cards-data/cards-data.slice";
import { startCardMoveWithSplitStackId } from "../features/cards/cards.actions";
import cards, {
  cardMove,
  hoverCard,
  hoverLeaveCard,
} from "../features/cards/cards.slice";
import game, {
  moveCounter,
  updatePosition,
  updateZoom,
} from "../features/game/game.slice";

const rootReducer = combineReducers({
  game: undoable(game, {
    limit: 20,
    groupBy: groupByActionTypes([moveCounter.type]),
    filter: excludeAction([updateZoom.type, updatePosition.type]),
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
