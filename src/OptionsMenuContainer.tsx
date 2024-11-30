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
} from "./features/cards/cards.slice";
import { toggleNotes } from "./features/notes/notes.slice";
import {
  shuffleStack,
  adjustCounterToken,
} from "./features/cards/cards.thunks";
import { getGame, getSnapCardsToGrid } from "./features/game/game.selectors";
import { RootState } from "./store/rootReducer";
import OptionsMenu from "./OptionsMenu";
import {
  showRadialMenuAtPosition,
  showSettingsUi,
  toggleDrawCardsIntoHand,
  toggleSnapCardsToGrid,
} from "./features/game/game.slice";
import { myPeerRef } from "./constants/app-constants";
import { isNoteVisible } from "./features/notes/notes.selectors";
import { undo, redo } from "./features/game/undo-redo.thunks";

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
  undo,
  redo,
  toggleDrawCardsIntoHand,
  toggleSnapCardsToGrid,
  showSettingsUi,
})(OptionsMenu);

export default OptionsMenuContainer;
