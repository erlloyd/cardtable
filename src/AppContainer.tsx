import {connect} from 'react-redux';
import Types from 'Types';
import App from './App';
import * as cardActions from './features/cards/actions';
import * as cardThunks from './features/cardsData/thunks';

const mapStateToProps = (state: Types.RootState) => {
  return {
    cards: state.cards
  }
}

const AppContainer = connect(
  mapStateToProps,
  {
    cardMove: cardActions.moveCard,
    endCardMove: cardActions.endCardMove,
    exhaustCard: cardActions.exhaustCard,
    selectCard: cardActions.selectCard,
    selectMultipleCards: cardActions.selectMultipleCards,
    startCardMove: cardActions.startCardMove,
    unselectAllCards: cardActions.unselectAllCards,
    zFetchData: cardThunks.loadCard,
  }
)(App);

export default AppContainer