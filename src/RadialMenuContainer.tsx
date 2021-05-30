import { connect } from "react-redux";
// import {
//   getMultiselectMode,
//   getPanMode,
// } from "./features/cards/cards.selectors";
import {
  exhaustCard,
  flipCards,
  // togglePanMode,
  // toggleMultiselectMode,
  // toggleToken,
  // adjustCounterToken,
} from "./features/cards/cards.slice";
// import { shuffleStack } from "./features/cards/cards.thunks";
import { getGame, getRadialMenuPosition } from "./features/game/game.selectors";
import { hideRadialMenu } from "./features/game/game.slice";
import RadialMenu from "./RadialMenu";
import { RootState } from "./store/rootReducer";

const mapStateToProps = (state: RootState) => {
  return {
    currentGameType: getGame(state).activeGameType,
    position: getRadialMenuPosition(state),
  };
};

const RadialMenuContainer = connect(mapStateToProps, {
  // togglePanMode,
  // toggleMultiselectMode,
  flipCards,
  exhaustCard,
  // toggleToken,
  // shuffleStack,
  // adjustCounterToken,
  hideRadialMenu,
})(RadialMenu);

export default RadialMenuContainer;
