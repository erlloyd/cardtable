import {combineReducers} from 'redux';
import cards from '../features/cards/reducer';
import cardsData from '../features/cardsData/reducer'

const rootReducer = combineReducers({
  cards,
  cardsData
});

export default rootReducer;