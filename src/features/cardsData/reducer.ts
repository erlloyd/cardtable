import { ActionType, getType } from 'typesafe-actions';
import * as actions from './actions';
import initialState, { ICardMetadataState } from './initialState';
export type CardMetadataActions = ActionType<typeof actions>;

export default (state = initialState, action: CardMetadataActions): ICardMetadataState => {
  switch (action.type) {
    case getType(actions.startLoadCardMetadata):
      return {...state, loading: true};
    default:
      return state;
  }
}