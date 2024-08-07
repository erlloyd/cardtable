import { connect } from "react-redux";
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
  toggleTopCardOfStackFaceup,
} from "./features/cards/cards.slice";
import {
  adjustCounterToken,
  addToPlayerHandWithRoleCheck,
  drawCardsOutOfCardStack,
  shuffleStack,
} from "./features/cards/cards.thunks";
import { getGame, getSnapCardsToGrid } from "./features/game/game.selectors";
import {
  setDrawingArrow,
  showCardPeekForCards,
  showRadialMenuAtPosition,
  toggleDrawCardsIntoHand,
  toggleSnapCardsToGrid,
} from "./features/game/game.slice";
import { RootState } from "./store/rootReducer";
import { getCardsDataEntities } from "./features/cards-data/cards-data.selectors";
import { redo, undo } from "./features/game/undo-redo.thunks";

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
    cardData: getCardsDataEntities(state),
  };
};

const ContextualOptionsMenuContainer = connect(mapStateToProps, {
  togglePanMode,
  toggleMultiselectMode,
  toggleToken,
  adjustStatusToken,
  adjustCounterToken,
  showRadialMenuAtPosition,
  undo,
  redo,
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
  showCardPeekForCards,
  toggleTopCardOfStackFaceup,
})(ContextualOptionsMenu);

export default ContextualOptionsMenuContainer;
