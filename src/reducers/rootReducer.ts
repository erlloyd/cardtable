import {combineReducers} from 'redux';
import cards from './cardsReducer';

const rootReducer = combineReducers({
  cards
});

export default rootReducer;