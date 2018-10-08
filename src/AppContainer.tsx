import {connect} from 'react-redux';
import * as cardActions from './actions/cardActions';
import App from './App';

const mapStateToProps = (state: any) => {
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