import {connect} from 'react-redux';
import Types from 'Types';
import App from './App';
import * as cardActions from './features/cards/actions';
import { get3RandomCards } from './features/cardsData/selectors';
import * as cardThunks from './features/cardsData/thunks';

const mapStateToProps = (state: Types.RootState) => {
  return {
    cards: state.cards,
    cardsData: get3RandomCards(state)
  }
}

const AppContainer = connect(
  mapStateToProps,
  {
    cardMove: cardActions.moveCard,
    endCardMove: cardActions.endCardMove,
    exhaustCard: cardActions.exhaustCard,
    loadData: cardThunks.loadAllCardDataFromJSON,
    selectCard: cardActions.selectCard,
    selectMultipleCards: cardActions.selectMultipleCards,
    startCardMove: cardActions.startCardMove,
    unselectAllCards: cardActions.unselectAllCards,
  }
)(App);

export default AppContainer