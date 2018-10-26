import {connect} from 'react-redux';
import Types from 'Types';
import * as cardActions from './actions/cardActions';
import App from './App';

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
    unselectAllCards: cardActions.unselectAllCards
  }
)(App);

export default AppContainer