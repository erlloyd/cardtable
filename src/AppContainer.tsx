import { connect } from "react-redux";
import { ActionCreators } from "redux-undo";
import App from "./App";
import { getCardsDataEntities } from "./features/cards-data/cards-data.selectors";
import { loadCardsData } from "./features/cards-data/cards-data.slice";
import {
  getCards,
  getDropTargetCardsById,
  getPanMode,
  shouldShowPreview,
} from "./features/cards/cards.selectors";
import {
  adjustCounterToken,
  cardMove,
  endCardMove,
  exhaustCard,
  flipCards,
  hoverCard,
  hoverLeaveCard,
  selectCard,
  selectMultipleCards,
  togglePanMode,
  toggleSelectCard,
  toggleToken,
  unselectAllCards,
  unselectCard,
} from "./features/cards/cards.slice";
import {
  addCardStack,
  fetchDecklistById,
  pullCardOutOfCardStack,
  startCardMove,
  shuffleStack,
  drawCardsOutOfCardStack,
} from "./features/cards/cards.thunks";
import {
  getGame,
  getPeerId,
  getPlayerColors,
} from "./features/game/game.selectors";
import {
  connectToRemoteGame,
  updatePosition,
  updateZoom,
  requestResync,
} from "./features/game/game.slice";

import {
  moveCounter,
  removeCounter,
  updateCounterValue,
} from "./features/counters/counters.slice";
import { addNewCounter } from "./features/counters/counters.thunks";
import { resetApp } from "./store/global.actions";
import { RootState } from "./store/rootReducer";
import { getCurrentCounters } from "./features/counters/counters.selectors";

const mapStateToProps = (state: RootState) => {
  return {
    playerColors: getPlayerColors(state),
    cards: getCards(state),
    cardsData: getCardsDataEntities(state),
    showPreview: shouldShowPreview(state),
    panMode: getPanMode(state),
    gameState: getGame(state),
    counters: getCurrentCounters(state),
    peerId: getPeerId(state),
    dropTargetCardsById: getDropTargetCardsById(state),
  };
};

const AppContainer = connect(mapStateToProps, {
  cardMove,
  endCardMove,
  exhaustCard,
  loadCardsData,
  selectCard,
  unselectCard,
  toggleSelectCard,
  selectMultipleCards,
  startCardMove,
  unselectAllCards,
  hoverCard,
  hoverLeaveCard,
  togglePanMode,
  flipCards,
  shuffleStack,
  fetchDecklistById,
  updateZoom,
  updatePosition,
  resetApp,
  addCardStack,
  toggleToken,
  adjustCounterToken,
  pullCardOutOfCardStack,
  addNewCounter,
  updateCounterValue,
  removeCounter,
  moveCounter,
  connectToRemoteGame,
  requestResync,
  undo: ActionCreators.undo,
  redo: ActionCreators.redo,
  drawCardsOutOfCardStack,
})(App);

export default AppContainer;
