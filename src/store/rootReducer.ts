import {combineReducers} from 'redux';
import cards from '../features/cards/cards.slice';
// import cardsData from '../features/cardsData/reducer'

const rootReducer = combineReducers({
  cards,
});

export type RootState = ReturnType<typeof rootReducer>;

export default rootReducer;