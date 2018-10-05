import {connect} from 'react-redux';
import { 
  END_CARD_MOVE,
  EXHAUST_CARD,
  SELECT_CARD,
  START_CARD_MOVE,
} from './actions/actionTypes';
import {
  cardMove,
  selectMultipleCards,
  simpleCardAction,
  unselectAllCards
} from './actions/cardActions';
import App from './App';

const mapStateToProps = (state: any) => {
  return {
    cards: state.cards
  }
}

const mapDispatchToProps = (dispatch: any) => {
  return {
    cardMove: (id: number, dx: number, dy: number) => {
      return dispatch(cardMove(id, dx, dy));
    },
    endCardMove: (id: number) => {
      return dispatch(simpleCardAction(END_CARD_MOVE, id));
    },
    exhaustCard: (id: number) => {
      return dispatch(simpleCardAction(EXHAUST_CARD, id));
    },
    selectCard: (id: number) => {
      return dispatch(simpleCardAction(SELECT_CARD, id));
    },
    selectMultipleCards: (ids: number[]) => {
      return dispatch(selectMultipleCards(ids));
    },
    startCardMove: (id: number) => {
      return dispatch(simpleCardAction(START_CARD_MOVE, id));
    },
    unselectAllCards: () => {
      return dispatch(unselectAllCards());
    }
  }
}

const AppContainer = connect(
  mapStateToProps,
  mapDispatchToProps
)(App);

export default AppContainer