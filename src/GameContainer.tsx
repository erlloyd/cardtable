import { connect } from "react-redux";
import { ActionCreators } from "redux-undo";
import Game from "./Game";
import { myPeerRef } from "./constants/app-constants";
import {
  endDisconnectedArrow,
  removeAllArrows,
  removeAnyDisconnectedArrows,
  updateDisconnectedArrowPosition,
} from "./features/arrows/arrows.slice";
import { startNewArrow } from "./features/arrows/arrows.thunks";
import { getCardsDataEntities } from "./features/cards-data/cards-data.selectors";
import { loadCardsData } from "./features/cards-data/cards-data.slice";
import {
  allCustomData,
  allJsonData,
  parseCsvCustomCards,
  removeCustomCards,
} from "./features/cards-data/cards-data.thunks";
import {
  getCards,
  getDropTargetCardsById,
  getMultiselectMode,
  getPanMode,
  getPlayerCardsForPlayerNumber,
} from "./features/cards/cards.selectors";
import {
  addExtraIcon,
  addToExistingCardStack,
  adjustModifier,
  adjustStatusToken,
  clearAllModifiers,
  clearMyGhostCards,
  createNewPlayerBoards,
  deleteCardStack,
  exhaustAllCards,
  flipCards,
  removeExtraIcon,
  selectCard,
  selectMultipleCards,
  togglePanMode,
  toggleSelectCard,
  toggleToken,
  toggleTopCardOfStackFaceup,
  unselectAllCards,
  unselectCard,
} from "./features/cards/cards.slice";
import {
  addCardStack,
  addCardStackToPlayerBoardSlot,
  addToPlayerHandWithRoleCheck,
  adjustCounterToken,
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
import {
  getCurrentCounters,
  getCurrentTokens,
} from "./features/counters/counters.selectors";
import {
  createNewTokens,
  flipToken,
  moveCounter,
  moveToken,
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
  getRotatePreviewCard180,
  isDoneLoadingJSONData,
} from "./features/game/game.selectors";
import {
  clearPreviewCard,
  connectToRemoteGame,
  createNewMultiplayerGame,
  quitGame,
  requestResync,
  setDrawingArrow,
  setPreviewCardId,
  showCardPeekForCards,
  showDeckSearch,
  showDeckTextImporter,
  showRadialMenuAtPosition,
  showSpecificCardLoader,
  toggleDrawCardsIntoHand,
  togglePreviewCardRotation,
  toggleSnapCardsToGrid,
  updatePosition,
  updateZoom,
} from "./features/game/game.slice";
import {
  generateGameStateSave,
  generateGameStateUrl,
  loadAndStoreChangelog,
  loadGameStateFromSave,
  saveDeckAsJson,
} from "./features/game/game.thunks";
import { redo, undo } from "./features/game/undo-redo.thunks";
import { toggleNotes } from "./features/notes/notes.slice";
import { resetPlaymats } from "./features/playmats/playmats.slice";
import { addNewPlaymatInColumn } from "./features/playmats/playmats.thunks";
import { spawnTokenBags } from "./features/token-bags/token-bags.thunks";
import { resetApp } from "./store/global.actions";
import { RootState } from "./store/rootReducer";

const mapStateToProps = (state: RootState) => {
  const playerNumbers = getPlayerNumbers(state);
  const myPlayerNumber = playerNumbers[myPeerRef] ?? 1;

  const currentPlayerNumber =
    getGame(state).currentVisiblePlayerHandNumber ?? myPlayerNumber;

  return {
    playerColors: getPlayerColors(state),
    playerNumbers: playerNumbers,
    cards: getCards(state),
    cardsData: getCardsDataEntities(state),
    panMode: getPanMode(state),
    multiselectMode: getMultiselectMode(state),
    gameState: getGame(state),
    counters: getCurrentCounters(state),
    tokens: getCurrentTokens(state),
    peerId: getPeerId(state),
    multiplayerGameName: getMultiplayerGameName(state),
    dropTargetCardsById: getDropTargetCardsById(state),
    menuPreviewCard: getMenuPreviewCard(state),
    isDoneLoadingJSONData: isDoneLoadingJSONData(state),
    currentPlayerRole:
      getPlayerCardsForPlayerNumber(currentPlayerNumber)(state)?.role ?? null,
    rotatePreviewCard180: getRotatePreviewCard180(state),
  };
};

const GameContainer = connect(mapStateToProps, {
  cardMove,
  endCardMove,
  cardFromHandMove,
  exhaustAllCards,
  deleteCardStack,
  loadCardsData,
  allJsonData,
  spawnTokenBags,
  allCustomData,
  selectCard,
  unselectCard,
  toggleSelectCard,
  selectMultipleCards,
  startCardMove,
  unselectAllCards,
  togglePanMode,
  toggleDrawCardsIntoHand,
  toggleSnapCardsToGrid,
  toggleNotes,
  flipCards,
  shuffleStack,
  fetchDecklistById,
  updateZoom,
  updatePosition,
  resetApp,
  addCardStack,
  addCardStackToPlayerBoardSlot,
  toggleToken,
  adjustStatusToken,
  adjustCounterToken,
  pullCardOutOfCardStack,
  addNewCounter,
  updateCounterValue,
  removeCounter,
  moveCounter,
  connectToRemoteGame,
  createNewMultiplayerGame,
  requestResync,
  undo,
  redo,
  clearHistory: ActionCreators.clearHistory,
  drawCardsOutOfCardStack,
  setPreviewCardId,
  clearPreviewCard,
  quitGame,
  updateCounterColor,
  createDeckFromTxt,
  createDeckFromJson,
  generateGameStateUrl,
  generateGameStateSave,
  loadGameStateFromSave,
  saveDeckAsJson,
  showRadialMenuAtPosition,
  showSpecificCardLoader,
  showDeckSearch,
  showDeckTextImporter,
  adjustModifier,
  clearAllModifiers,
  addToPlayerHandWithRoleCheck,
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
  createNewTokens,
  createNewPlayerBoards,
  moveToken,
  flipToken,
  togglePreviewCardRotation,
  addNewPlaymatInColumn,
  resetPlaymats,
  parseCsvCustomCards,
  removeCustomCards,
  showCardPeekForCards,
  toggleTopCardOfStackFaceup,
  loadAndStoreChangelog,
})(Game);

export default GameContainer;
