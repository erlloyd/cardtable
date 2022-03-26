import { connect } from "react-redux";
import {
  anyCardsSelectedWithPeerRef,
  getMultiselectMode,
  getPanMode,
} from "./features/cards/cards.selectors";
import {
  exhaustCard,
  flipCards,
  togglePanMode,
  toggleMultiselectMode,
  toggleToken,
  adjustCounterToken,
} from "./features/cards/cards.slice";
import { shuffleStack } from "./features/cards/cards.thunks";
import { getGame, getSnapCardsToGrid } from "./features/game/game.selectors";
import { RootState } from "./store/rootReducer";
import ContextualOptionsMenu from "./ContextualOptionsMenu";
import {
  showRadialMenuAtPosition,
  toggleDrawCardsIntoHand,
  toggleSnapCardsToGrid,
} from "./features/game/game.slice";
import { myPeerRef } from "./constants/app-constants";
import { ActionCreators } from "redux-undo";

const mapStateToProps = (state: RootState) => {
  return {
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
  flipCards,
  exhaustCard,
  toggleToken,
  shuffleStack,
  adjustCounterToken,
  showRadialMenuAtPosition,
  undo: ActionCreators.undo,
  redo: ActionCreators.redo,
  toggleDrawCardsIntoHand,
  toggleSnapCardsToGrid,
})(ContextualOptionsMenu);

export default ContextualOptionsMenuContainer;
