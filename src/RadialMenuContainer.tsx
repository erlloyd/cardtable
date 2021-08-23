import { connect } from "react-redux";
import { myPeerRef } from "./constants/app-constants";
import { cardsSelectedWithPeerRef } from "./features/cards/cards.selectors";
import {
  exhaustCard,
  flipCards,
  toggleToken,
  adjustCounterToken,
  clearCardTokens,
  adjustModifier,
} from "./features/cards/cards.slice";
import {
  shuffleStack,
  drawCardsOutOfCardStack,
} from "./features/cards/cards.thunks";
import { getGame, getRadialMenuPosition } from "./features/game/game.selectors";
import { hideRadialMenu } from "./features/game/game.slice";
import RadialMenu from "./RadialMenu";
import PlanetMenu from "./PlanetMenu";
import { RootState } from "./store/rootReducer";

const usePlanetMenu = true;

const mapStateToProps = (state: RootState) => {
  return {
    selectedCardStacks: cardsSelectedWithPeerRef(myPeerRef)(state),
    currentGameType: getGame(state).activeGameType,
    position: getRadialMenuPosition(state),
  };
};

const RadialMenuContainer = connect(mapStateToProps, {
  flipCards,
  exhaustCard,
  toggleToken,
  shuffleStack,
  adjustCounterToken,
  hideRadialMenu,
  clearCardTokens,
  drawCardsOutOfCardStack,
  adjustModifier,
})(usePlanetMenu ? PlanetMenu : RadialMenu);

export default RadialMenuContainer;
