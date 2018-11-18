import { createAction } from 'typesafe-actions';

export const startLoadCardMetadata = createAction('cards/START_LOAD_CARD_METADATA', resolve => {
  return (id: number) => resolve({id});
});

// export const receivedCardMetadata = createAction('cards/RECEIVED_CARD_METADATA', resolve => {
//   return (id: number, metadata: any) => resolve({id, metadata});
// });

// export const loadCardMetadataComplete = createAction('cards/LOAD_CARD_METADATA_COMPLETE', resolve => {
//   return (id: number, error: boolean, errorMessage: string) => resolve({id, error, errorMessage});
// });