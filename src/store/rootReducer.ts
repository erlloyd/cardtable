import {combineReducers} from 'redux';
import cards from '../features/cards/cards.slice';
import cardsData from '../features/cards-data/cards-data.slice'

const rootReducer = combineReducers({
  cards,
  cardsData,
});

export type RootState = ReturnType<typeof rootReducer>;

export default rootReducer;