import { connect } from "react-redux";
import { ActionCreators } from "redux-undo";
import Game from "./Game";
import { getCardsDataEntities } from "./features/cards-data/cards-data.selectors";
import { loadCardsData } from "./features/cards-data/cards-data.slice";
import {
  getCards,
  getDropTargetCardsById,
  getMultiselectMode,
  getPanMode,
} from "./features/cards/cards.selectors";
import {
  adjustCounterToken,
  cardFromHandMove,
  exhaustCard,
  deleteCardStack,
  flipCards,
  selectCard,
  selectMultipleCards,
  togglePanMode,
  toggleSelectCard,
  toggleToken,
  unselectAllCards,
  unselectCard,
  adjustModifier,
  clearAllModifiers,
  addToPlayerHand,
  addToExistingCardStack,
  addExtraIcon,
  removeExtraIcon,
} from "./features/cards/cards.slice";
import {
  addCardStack,
  fetchDecklistById,
  pullCardOutOfCardStack,
  startCardMove,
  shuffleStack,
  drawCardsOutOfCardStack,
  createDeckFromTxt,
  createDeckFromJson,
  cardMove,
  endCardMove,
} from "./features/cards/cards.thunks";
import {
  generateGameStateUrl,
  saveDeckAsJson,
} from "./features/game/game.thunks";
import { allJsonData } from "./features/cards-data/cards-data.thunks";
import {
  getGame,
  getMenuPreviewCard,
  getPeerId,
  getPlayerColors,
  getPlayerNumbers,
} from "./features/game/game.selectors";
import {
  connectToRemoteGame,
  updatePosition,
  updateZoom,
  requestResync,
  setPreviewCardId,
  clearPreviewCard,
  quitGame,
  showRadialMenuAtPosition,
  showSpecificCardLoader,
} from "./features/game/game.slice";

import {
  moveCounter,
  removeCounter,
  updateCounterValue,
  updateCounterColor,
} from "./features/counters/counters.slice";
import { addNewCounter } from "./features/counters/counters.thunks";
import { resetApp } from "./store/global.actions";
import { RootState } from "./store/rootReducer";
import { getCurrentCounters } from "./features/counters/counters.selectors";

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
})(Game);

export default GameContainer;
