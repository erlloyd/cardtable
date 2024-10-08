import { combineReducers } from "redux";
import undoable, { excludeAction, groupByActionTypes } from "redux-undo";
import cardsData from "../features/cards-data/cards-data.slice";
import { startCardMoveWithSplitStackId } from "../features/cards/cards.actions";
import cards, {
  cardFromHandMoveWithSnap,
  cardMoveWithSnap,
  movePlayerBoard,
} from "../features/cards/cards.slice";
import game, {
  clearPreviewCard,
  setPreviewCardId,
  stopDraggingCardFromHand,
} from "../features/game/game.slice";
import playmats from "../features/playmats/playmats.slice";
import tokenBags from "../features/token-bags/token-bags.slice";
import notifications from "../features/notifications/notifications.slice";

import counters, {
  moveCounter,
  movingTokens,
} from "../features/counters/counters.slice";
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
  playmats,
  tokenBags,
});

const rootReducer = combineReducers({
  game,
  cardsData,
  notifications,
  liveState: undoable(undoableState, {
    limit: 40,
    groupBy: groupByActionTypes([moveCounter.type, movePlayerBoard.type]),
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
      movingTokens.type,
    ]),
  }),
});

export type RootState = ReturnType<typeof rootReducer>;

export default rootReducer;
