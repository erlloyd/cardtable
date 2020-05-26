import {connect} from 'react-redux';
// import Types from 'Types';
import App from './App';
import { 
  selectCard,
  exhaustCard,
  startCardMove,
  cardMove,
  endCardMove,
} from './features/cards/cards.slice'
// import * as cardActions from './features/cards/actions';
// import { shouldShowPreview } from './features/cards/selectors';
// import { get3RandomPlayerCardDatas } from './features/cardsData/selectors';
// import * as cardThunks from './features/cardsData/thunks';
import * as CoreSet from './external/ringsteki-json-data/packs/Core Set.json';

// import { initialState as initialCardsState } from './features/cards/initialState';
import { RootState } from './store/rootReducer';

const mapStateToProps = (state: RootState) => {
  return {
    cards: state.cards,
    cardsData: CoreSet.cards.slice(0, 3), //get3RandomPlayerCardDatas(state),
    showPreview: false //shouldShowPreview(state)
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
    selectMultipleCards: () => {},
    startCardMove,
    unselectAllCards: () => {},
    hoverCard: () => {},
    hoverLeaveCard: () => {},
    // cardMove: cardActions.moveCard,
    // endCardMove: cardActions.endCardMove,
    // exhaustCard: cardActions.exhaustCard,
    // loadData: cardThunks.loadAllCardDataFromJSON,
    // selectCard: cardActions.selectCard,
    // selectMultipleCards: cardActions.selectMultipleCards,
    // startCardMove: cardActions.startCardMove,
    // unselectAllCards: cardActions.unselectAllCards,
    // hoverCard: cardActions.hoverCard,
    // hoverLeaveCard: cardActions.hoverLeaveCard
  }
)(App);

export default AppContainer