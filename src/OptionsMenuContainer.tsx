import { connect } from "react-redux";
import {
  anyCardsSelectedWithPeerRef,
  getMultiselectMode,
  getPanMode,
} from "./features/cards/cards.selectors";
import {
  exhaustAllCards,
  flipCards,
  togglePanMode,
  toggleMultiselectMode,
  toggleToken,
  adjustCounterToken,
} from "./features/cards/cards.slice";
import { toggleNotes } from "./features/notes/notes.slice";
import { shuffleStack } from "./features/cards/cards.thunks";
import { getGame, getSnapCardsToGrid } from "./features/game/game.selectors";
import { RootState } from "./store/rootReducer";
import OptionsMenu from "./OptionsMenu";
import {
  showRadialMenuAtPosition,
  toggleDrawCardsIntoHand,
  toggleSnapCardsToGrid,
} from "./features/game/game.slice";
import { myPeerRef } from "./constants/app-constants";
import { ActionCreators } from "redux-undo";
import { isNoteVisible } from "./features/notes/notes.selectors";

const mapStateToProps = (state: RootState) => {
  return {
    anyCardsSelected: anyCardsSelectedWithPeerRef(myPeerRef)(state),
    currentGameType: getGame(state).activeGameType,
    panMode: getPanMode(state),
    multiselectMode: getMultiselectMode(state),
    drawCardsIntoHand: getGame(state).drawCardsIntoHand,
    snapCardsToGrid: getSnapCardsToGrid(state),
    notesVisible: isNoteVisible(state),
  };
};

const OptionsMenuContainer = connect(mapStateToProps, {
  togglePanMode,
  toggleNotes,
  toggleMultiselectMode,
  flipCards,
  exhaustAllCards,
  toggleToken,
  shuffleStack,
  adjustCounterToken,
  showRadialMenuAtPosition,
  undo: ActionCreators.undo,
  redo: ActionCreators.redo,
  toggleDrawCardsIntoHand,
  toggleSnapCardsToGrid,
})(OptionsMenu);

export default OptionsMenuContainer;
