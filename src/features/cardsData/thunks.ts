// import { Dispatch } from 'redux';
// import { CardMetadataActions } from '../cardsData';
import * as actions from './actions';

export const loadCard = (id: number) => (dispatch: any, getState: any) => {
      // tslint:disable-next-line:no-console
      console.log('here');
      dispatch(actions.startLoadCardMetadata(id));
    };