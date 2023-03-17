import { combineReducers } from "redux";
import undoable, { excludeAction, groupByActionTypes } from "redux-undo";
import cardsData from "../features/cards-data/cards-data.slice";
import { startCardMoveWithSplitStackId } from "../features/cards/cards.actions";
import cards, {
  cardFromHandMoveWithSnap,
  cardMoveWithSnap,
} from "../features/cards/cards.slice";
import game, {
  clearPreviewCard,
  setPreviewCardId,
  stopDraggingCardFromHand,
} from "../features/game/game.slice";

import counters, { moveCounter } from "../features/counters/counters.slice";
import arrows, {
  startNewArrowForCards,
  updateDisconnectedArrowPosition,
} from "../features/arrows/arrows.slice";
import notes from "../features/notes/notes.slice";
import { startDraggingCardFromHand } from "./global.actions";

const undoableState = combineReducers({
  arrows,
  counters,
  cards,
  notes,
});

const rootReducer = combineReducers({
  game,
  cardsData,
  liveState: undoable(undoableState, {
    limit: 40,
    groupBy: groupByActionTypes([moveCounter.type]),
    filter: excludeAction([
      startNewArrowForCards.type,
      updateDisconnectedArrowPosition.type,
      startCardMoveWithSplitStackId.type,
      cardMoveWithSnap.type,
      startDraggingCardFromHand.type,
      stopDraggingCardFromHand.type,
      cardFromHandMoveWithSnap.type,
      setPreviewCardId.type,
      clearPreviewCard.type,
    ]),
  }),
});

export type RootState = ReturnType<typeof rootReducer>;

export default rootReducer;
