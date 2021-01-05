import { connect } from "react-redux";
import App from "./App";
import { getCardsDataEntities } from "./features/cards-data/cards-data.selectors";
import { loadCardsData } from "./features/cards-data/cards-data.slice";
import { fetchDecklistById } from "./features/cards/cards.async-thunks";
import {
  getCards,
  getPanMode,
  shouldShowPreview,
} from "./features/cards/cards.selectors";
import {
  addCardStack,
  cardMove,
  endCardMove,
  exhaustCard,
  flipCards,
  hoverCard,
  hoverLeaveCard,
  selectCard,
  selectMultipleCards,
  shuffleStack,
  startCardMove,
  togglePanMode,
  toggleSelectCard,
  unselectAllCards,
  unselectCard,
  toggleToken,
  adjustCounterToken,
  pullCardOutOfCardStack,
} from "./features/cards/cards.slice";
import { getGame } from "./features/game/game.selectors";
import {
  updatePosition,
  updateZoom,
  addNewCounter,
  updateCounterValue,
  removeCounter,
  moveCounter,
} from "./features/game/game.slice";
import { RootState } from "./store/rootReducer";
import { resetApp } from "./store/global.actions";

const mapStateToProps = (state: RootState) => {
  return {
    cards: getCards(state),
    cardsData: getCardsDataEntities(state),
    showPreview: shouldShowPreview(state),
    panMode: getPanMode(state),
    gameState: getGame(state),
  };
};

const AppContainer = connect(mapStateToProps, {
  cardMove,
  endCardMove,
  exhaustCard,
  loadCardsData,
  selectCard,
  unselectCard,
  toggleSelectCard,
  selectMultipleCards,
  startCardMove,
  unselectAllCards,
  hoverCard,
  hoverLeaveCard,
  togglePanMode,
  flipCards,
  shuffleStack,
  fetchDecklistById,
  updateZoom,
  updatePosition,
  resetApp,
  addCardStack,
  toggleToken,
  adjustCounterToken,
  pullCardOutOfCardStack,
  addNewCounter,
  updateCounterValue,
  removeCounter,
  moveCounter,
})(App);

export default AppContainer;
