import { CardData } from 'src/external-api/beorn-json-data';
import { createAction } from 'typesafe-actions';

// export const startLoadCardMetadata = createAction('cardsData/START_LOAD_CARD_METADATA', resolve => {
//   return (id: number) => resolve({id});
// });

// export const receivedCardMetadata = createAction('cardsData/RECEIVED_CARD_METADATA', resolve => {
//   return (id: number, metadata: CardData) => resolve({id, metadata});
// });

// export const loadCardMetadataFailed = createAction('cardsData/LOAD_CARD_METADATA_FAILED', resolve => {
//   return (id: number, error: Error) => resolve({id, error});
// });

export const addNewCardMetadata = createAction('cardsData/ADD_NEW_CARD_METADATA', resolve => {
  return (metadata: CardData[]) => resolve({metadata});

});