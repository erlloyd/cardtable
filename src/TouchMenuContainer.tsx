import { connect } from "react-redux";
import { getPanMode } from "./features/cards/cards.selectors";
import {
  exhaustCard,
  flipCards,
  togglePanMode,
  toggleToken,
  adjustCounterToken,
} from "./features/cards/cards.slice";
import { shuffleStack } from "./features/cards/cards.thunks";
import { getGame } from "./features/game/game.selectors";
import { RootState } from "./store/rootReducer";
import TouchMenu from "./TouchMenu";

const mapStateToProps = (state: RootState) => {
  return {
    currentGameType: getGame(state).activeGameType,
    panMode: getPanMode(state),
  };
};

const TouchMenuContainer = connect(mapStateToProps, {
  togglePanMode,
  flipCards,
  exhaustCard,
  toggleToken,
  shuffleStack,
  adjustCounterToken,
})(TouchMenu);

export default TouchMenuContainer;
