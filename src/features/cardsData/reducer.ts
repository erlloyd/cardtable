import { ActionType, getType } from 'typesafe-actions';
import * as actions from './actions';
import initialState, { ICardMetadataState } from './initialState';
export type CardMetadataActions = ActionType<typeof actions>;

export default (state = initialState, action: CardMetadataActions): ICardMetadataState => {
  let newMeta;
  switch (action.type) {
    case getType(actions.addNewCardMetadata): 
      newMeta = state.metadata.concat(action.payload.metadata);
      return {...state, metadata: newMeta};
    // case getType(actions.startLoadCardMetadata):
    //   newMeta = Object.assign({}, state.metadata);
    //   newMeta[action.payload.id] = {id: action.payload.id, loading: true}
    //   return {...state, metadata: newMeta};
    // case getType(actions.receivedCardMetadata):
    //   newMeta = Object.assign({}, state.metadata);
    //   newMeta[action.payload.id] = {
    //     data: action.payload.metadata,
    //     id: action.payload.id,
    //     loading: false,
    //   }
    //   return {...state, metadata: newMeta}
    // case getType(actions.loadCardMetadataFailed):
    //   newMeta = Object.assign({}, state.metadata);
    //   newMeta[action.payload.id] = {
    //     data: undefined,
    //     error: action.payload.error,
    //     id: action.payload.id,
    //     loading: false
    //   }
    //   return {...state, metadata: newMeta};
    default:
      return state;
  }
}