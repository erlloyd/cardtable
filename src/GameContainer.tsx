import { connect } from "react-redux";
import { ActionCreators } from "redux-undo";
import { getCardsDataEntities } from "./features/cards-data/cards-data.selectors";
import { loadCardsData } from "./features/cards-data/cards-data.slice";
import { allJsonData } from "./features/cards-data/cards-data.thunks";
import {
  getCards,
  getDropTargetCardsById,
  getMultiselectMode,
  getPanMode,
} from "./features/cards/cards.selectors";
import {
  addExtraIcon,
  addToExistingCardStack,
  addToPlayerHand,
  adjustCounterToken,
  adjustModifier,
  clearAllModifiers,
  deleteCardStack,
  exhaustCard,
  flipCards,
  removeExtraIcon,
  selectCard,
  selectMultipleCards,
  togglePanMode,
  toggleSelectCard,
  toggleToken,
  unselectAllCards,
  unselectCard,
  clearMyGhostCards,
} from "./features/cards/cards.slice";
import {
  addCardStack,
  cardFromHandMove,
  cardMove,
  createDeckFromJson,
  createDeckFromTxt,
  drawCardsOutOfCardStack,
  endCardMove,
  fetchDecklistById,
  pullCardOutOfCardStack,
  shuffleStack,
  startCardMove,
} from "./features/cards/cards.thunks";
import { getCurrentCounters } from "./features/counters/counters.selectors";
import {
  moveCounter,
  removeCounter,
  updateCounterColor,
  updateCounterValue,
} from "./features/counters/counters.slice";
import { addNewCounter } from "./features/counters/counters.thunks";
import {
  getGame,
  getMenuPreviewCard,
  getPeerId,
  getPlayerColors,
  getPlayerNumbers,
} from "./features/game/game.selectors";
import {
  clearPreviewCard,
  connectToRemoteGame,
  quitGame,
  requestResync,
  setPreviewCardId,
  showRadialMenuAtPosition,
  showSpecificCardLoader,
  updatePosition,
  updateZoom,
  setDrawingArrow,
} from "./features/game/game.slice";
import {
  startNewArrow,
  updateDisconnectedArrowPosition,
  removeAnyDisconnectedArrows,
  endDisconnectedArrow,
} from "./features/arrows/arrows.slice";
import {
  generateGameStateUrl,
  saveDeckAsJson,
} from "./features/game/game.thunks";
import Game from "./Game";
import { resetApp } from "./store/global.actions";
import { RootState } from "./store/rootReducer";

const mapStateToProps = (state: RootState) => {
  return {
    playerColors: getPlayerColors(state),
    playerNumbers: getPlayerNumbers(state),
    cards: getCards(state),
    cardsData: getCardsDataEntities(state),
    panMode: getPanMode(state),
    multiselectMode: getMultiselectMode(state),
    gameState: getGame(state),
    counters: getCurrentCounters(state),
    peerId: getPeerId(state),
    dropTargetCardsById: getDropTargetCardsById(state),
    menuPreviewCard: getMenuPreviewCard(state),
  };
};

const GameContainer = connect(mapStateToProps, {
  cardMove,
  endCardMove,
  cardFromHandMove,
  exhaustCard,
  deleteCardStack,
  loadCardsData,
  allJsonData,
  selectCard,
  unselectCard,
  toggleSelectCard,
  selectMultipleCards,
  startCardMove,
  unselectAllCards,
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
  setPreviewCardId,
  clearPreviewCard,
  quitGame,
  updateCounterColor,
  createDeckFromTxt,
  createDeckFromJson,
  generateGameStateUrl,
  saveDeckAsJson,
  showRadialMenuAtPosition,
  showSpecificCardLoader,
  adjustModifier,
  clearAllModifiers,
  addToPlayerHand,
  addToExistingCardStack,
  addExtraIcon,
  removeExtraIcon,
  clearMyGhostCards,
  setDrawingArrow,
  startNewArrow,
  updateDisconnectedArrowPosition,
  removeAnyDisconnectedArrows,
  endDisconnectedArrow,
})(Game);

export default GameContainer;
