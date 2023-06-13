import { connect } from "react-redux";
import { ActionCreators } from "redux-undo";
import ContextualOptionsMenu from "./ContextualOptionsMenu";
import { myPeerRef } from "./constants/app-constants";
import { startNewArrow } from "./features/arrows/arrows.thunks";
import {
  anyCardsSelectedWithPeerRef,
  cardsSelectedWithPeerRef,
  getMultiselectMode,
  getPanMode,
} from "./features/cards/cards.selectors";
import {
  adjustCounterToken,
  adjustModifier,
  adjustStatusToken,
  clearCardTokens,
  deleteCardStack,
  exhaustAllCards,
  flipCards,
  toggleExtraIcon,
  toggleMultiselectMode,
  togglePanMode,
  toggleToken,
} from "./features/cards/cards.slice";
import {
  addToPlayerHandWithRoleCheck,
  drawCardsOutOfCardStack,
  shuffleStack,
} from "./features/cards/cards.thunks";
import { getGame, getSnapCardsToGrid } from "./features/game/game.selectors";
import {
  setDrawingArrow,
  showRadialMenuAtPosition,
  toggleDrawCardsIntoHand,
  toggleSnapCardsToGrid,
} from "./features/game/game.slice";
import { RootState } from "./store/rootReducer";

const mapStateToProps = (state: RootState) => {
  const playerNumberToShow =
    getGame(state).currentVisiblePlayerHandNumber ??
    getGame(state).playerNumbers[myPeerRef];
  return {
    selectedCardStacks: cardsSelectedWithPeerRef(myPeerRef)(state),
    playerNumber: playerNumberToShow,
    anyCardsSelected: anyCardsSelectedWithPeerRef(myPeerRef)(state),
    currentGameType: getGame(state).activeGameType,
    panMode: getPanMode(state),
    multiselectMode: getMultiselectMode(state),
    drawCardsIntoHand: getGame(state).drawCardsIntoHand,
    snapCardsToGrid: getSnapCardsToGrid(state),
  };
};

const ContextualOptionsMenuContainer = connect(mapStateToProps, {
  togglePanMode,
  toggleMultiselectMode,
  toggleToken,
  adjustStatusToken,
  adjustCounterToken,
  showRadialMenuAtPosition,
  undo: ActionCreators.undo,
  redo: ActionCreators.redo,
  toggleDrawCardsIntoHand,
  toggleSnapCardsToGrid,
  //For sure using
  shuffleStack,
  clearCardTokens,
  flipCards,
  exhaustAllCards,
  deleteCardStack,
  addToPlayerHandWithRoleCheck,
  setDrawingArrow,
  startNewArrow,
  adjustModifier,
  toggleExtraIcon,
  drawCardsOutOfCardStack,
})(ContextualOptionsMenu);

export default ContextualOptionsMenuContainer;
