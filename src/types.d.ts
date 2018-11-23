import { StateType } from 'typesafe-actions';
import { CardsAction } from './features/cards';
import rootReducer from './reducers/rootReducer';

declare module 'Types' {
  export type RootState = StateType<typeof rootReducer>;
  export type RootAction = CardsAction;
}