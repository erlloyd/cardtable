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
  adjustStatusToken,
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
  getMultiplayerGameName,
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
  showDeckSearch,
} from "./features/game/game.slice";
import {
  updateDisconnectedArrowPosition,
  removeAnyDisconnectedArrows,
  endDisconnectedArrow,
  removeAllArrows,
} from "./features/arrows/arrows.slice";
import {
  generateGameStateUrl,
  saveDeckAsJson,
} from "./features/game/game.thunks";
import Game from "./Game";
import { resetApp } from "./store/global.actions";
import { RootState } from "./store/rootReducer";
import { startNewArrow } from "./features/arrows/arrows.thunks";

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
    multiplayerGameName: getMultiplayerGameName(state),
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
  adjustStatusToken,
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
  showDeckSearch,
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
  removeAllArrows,
})(Game);

export default GameContainer;
