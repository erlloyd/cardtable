import { connect } from "react-redux";
import TouchMenu from "./TouchMenu";
import { getPanMode } from "./features/cards/cards.selectors";
import {
  exhaustCard,
  flipCards,
  togglePanMode,
  toggleToken,
} from "./features/cards/cards.slice";
import { RootState } from "./store/rootReducer";
import { getGame } from "./features/game/game.selectors";

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
})(TouchMenu);

export default TouchMenuContainer;
