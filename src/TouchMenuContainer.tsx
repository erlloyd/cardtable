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
import { getGame } from "./features/game/game.selectors";
import { RootState } from "./store/rootReducer";
import TouchMenu from "./TouchMenu";
import { showRadialMenuAtPosition } from "./features/game/game.slice";
import { myPeerRef } from "./constants/app-constants";

const mapStateToProps = (state: RootState) => {
  return {
    anyCardsSelected: anyCardsSelectedWithPeerRef(myPeerRef)(state),
    currentGameType: getGame(state).activeGameType,
    panMode: getPanMode(state),
    multiselectMode: getMultiselectMode(state),
  };
};

const TouchMenuContainer = connect(mapStateToProps, {
  togglePanMode,
  toggleMultiselectMode,
  flipCards,
  exhaustCard,
  toggleToken,
  shuffleStack,
  adjustCounterToken,
  showRadialMenuAtPosition,
})(TouchMenu);

export default TouchMenuContainer;
