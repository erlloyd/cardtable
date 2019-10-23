import {connect} from 'react-redux';
import Types from 'Types';
import App from './App';
import * as cardActions from './features/cards/actions';
import { shouldShowPreview } from './features/cards/selectors';
import { get3RandomPlayerCardDatas } from './features/cardsData/selectors';
import * as cardThunks from './features/cardsData/thunks';

const mapStateToProps = (state: Types.RootState) => {
  return {
    cards: state.cards,
    cardsData: get3RandomPlayerCardDatas(state),
    showPreview: shouldShowPreview(state)
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
    hoverCard: cardActions.hoverCard,
    hoverLeaveCard: cardActions.hoverLeaveCard
  }
)(App);

export default AppContainer