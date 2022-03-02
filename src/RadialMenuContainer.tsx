import { connect } from "react-redux";
import { myPeerRef } from "./constants/app-constants";
import { cardsSelectedWithPeerRef } from "./features/cards/cards.selectors";
import {
  exhaustCard,
  deleteCardStack,
  flipCards,
  toggleToken,
  adjustCounterToken,
  clearCardTokens,
  adjustModifier,
  addToPlayerHand,
  toggleExtraIcon,
} from "./features/cards/cards.slice";
import {
  shuffleStack,
  drawCardsOutOfCardStack,
} from "./features/cards/cards.thunks";
import { getGame, getRadialMenuPosition } from "./features/game/game.selectors";
import { hideRadialMenu, setDrawingArrow } from "./features/game/game.slice";
import RadialMenu from "./RadialMenu";
import PlanetMenu from "./PlanetMenu";
import { RootState } from "./store/rootReducer";
import { startNewArrow } from "./features/arrows/arrows.thunks";

const usePlanetMenu = false;

const mapStateToProps = (state: RootState) => {
  const playerNumberToShow =
    getGame(state).currentVisiblePlayerHandNumber ??
    getGame(state).playerNumbers[myPeerRef];
  return {
    selectedCardStacks: cardsSelectedWithPeerRef(myPeerRef)(state),
    currentGameType: getGame(state).activeGameType,
    position: getRadialMenuPosition(state),
    playerNumber: playerNumberToShow,
    drawCardsIntoHand: getGame(state).drawCardsIntoHand,
  };
};

const RadialMenuContainer = connect(mapStateToProps, {
  flipCards,
  exhaustCard,
  deleteCardStack,
  toggleToken,
  shuffleStack,
  adjustCounterToken,
  hideRadialMenu,
  clearCardTokens,
  drawCardsOutOfCardStack,
  adjustModifier,
  addToPlayerHand,
  toggleExtraIcon,
  setDrawingArrow,
  startNewArrow,
})(usePlanetMenu ? PlanetMenu : RadialMenu);

export default RadialMenuContainer;
