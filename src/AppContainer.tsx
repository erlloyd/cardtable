import {connect} from 'react-redux';
// import Types from 'Types';
import App from './App';
import { 
  selectCard,
  exhaustCard,
  startCardMove,
  cardMove,
  endCardMove,
  selectMultipleCards,
  unselectAllCards,
  hoverCard,
  hoverLeaveCard,
} from './features/cards/cards.slice'
// import * as cardActions from './features/cards/actions';
// import { shouldShowPreview } from './features/cards/selectors';
// import { get3RandomPlayerCardDatas } from './features/cardsData/selectors';
// import * as cardThunks from './features/cardsData/thunks';
// import * as CoreSet from './external/ringsteki-json-data/packs/Core Set.json';
import CoreSet from './external/marvelsdb-json-data/pack/core.json'

import { RootState } from './store/rootReducer';
import { shouldShowPreview, getCards } from './features/cards/cards.selectors';

const mapStateToProps = (state: RootState) => {
  return {
    cards: getCards(state),
    cardsData: /* CoreSet.cards.slice(0, 3) */CoreSet.slice(0, 3), //get3RandomPlayerCardDatas(state),
    showPreview: shouldShowPreview(state)
  }
}

// const mapDispatchToProps = {
//   selectCard,
// }

const AppContainer = connect(
  mapStateToProps,
  {
    cardMove,
    endCardMove,
    exhaustCard,
    loadData: () => {},
    selectCard,
    selectMultipleCards,
    startCardMove,
    unselectAllCards,
    hoverCard,
    hoverLeaveCard,
    // loadData: cardThunks.loadAllCardDataFromJSON,
  }
)(App);

export default AppContainer