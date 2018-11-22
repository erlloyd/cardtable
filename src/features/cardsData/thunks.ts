import axios from 'axios';
import { Dispatch } from 'redux';
import { CardData } from 'src/external-api/rings-db';
import * as actions from './actions';
import { ICardMetadataState } from './initialState';

export const loadCard = (id: number) => 
  async (dispatch: Dispatch, getState: any) => {
    // tslint:disable-next-line:no-debugger
    
    // TODO: Replace with selector
    const state: ICardMetadataState = getState().cardsData;

    try {
      // TODO: Replace with selector
      if (state.metadata[id] === undefined || !state.metadata[id].loading) {
        // tslint:disable-next-line:no-console
        dispatch(actions.startLoadCardMetadata(id));
        const response = await axios.get<CardData>(`https://ringsdb.com/api/public/card/${id}`);
        
        dispatch(actions.receivedCardMetadata(id, response.data));
        
      }
    } catch (e) {
      const err: Error = e;
      dispatch(actions.loadCardMetadataFailed(id, err));
    }
  };