import {connect} from 'react-redux';
import App from './App';
import { simpleCardAction, cardMove } from './actions/cardActions';
import { 
  EXHAUST_CARD,
  START_CARD_MOVE,
  END_CARD_MOVE, 
  SELECT_CARD
} from './actions/actionTypes';

const mapStateToProps = state => {
  return {
    cards: state.cards
  }
}

const mapDispatchToProps = dispatch => {
  return {
    exhaustCard: id => {
      return dispatch(simpleCardAction(EXHAUST_CARD, id));
    },
    startCardMove: id => {
      return dispatch(simpleCardAction(START_CARD_MOVE, id));
    },
    cardMove: (id, x, y) => {
      return dispatch(cardMove(id, x, y));
    },
    endCardMove: id => {
      return dispatch(simpleCardAction(END_CARD_MOVE, id));
    },
    selectCard: id => {
      return dispatch(simpleCardAction(SELECT_CARD, id));
    }
  }
}

const AppContainer = connect(
  mapStateToProps,
  mapDispatchToProps
)(App);

export default AppContainer