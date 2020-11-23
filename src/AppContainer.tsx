import { connect } from "react-redux";
// import Types from 'Types';
import App from "./App";
import { fetchDecklistById } from "./features/cards/cards.async-thunks";
import {
  selectCard,
  unselectCard,
  toggleSelectCard,
  exhaustCard,
  startCardMove,
  cardMove,
  endCardMove,
  selectMultipleCards,
  unselectAllCards,
  hoverCard,
  hoverLeaveCard,
  togglePanMode,
  flipCards,
  shuffleStack,
} from "./features/cards/cards.slice";
import { loadCardsData } from "./features/cards-data/cards-data.slice";
// import * as cardActions from './features/cards/actions';
// import { shouldShowPreview } from './features/cards/selectors';
// import { get3RandomPlayerCardDatas } from './features/cardsData/selectors';
// import * as cardThunks from './features/cardsData/thunks';
// import * as CoreSet from './external/ringsteki-json-data/packs/Core Set.json';
// import CoreSet from './external/marvelsdb-json-data/pack/core.json'

import { RootState } from "./store/rootReducer";
import {
  shouldShowPreview,
  getCards,
  getPanMode,
} from "./features/cards/cards.selectors";
import { getCardsDataEntities } from "./features/cards-data/cards-data.selectors";

const mapStateToProps = (state: RootState) => {
  return {
    cards: getCards(state),
    cardsData: getCardsDataEntities(state),
    showPreview: shouldShowPreview(state),
    panMode: getPanMode(state),
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
})(App);

export default AppContainer;
