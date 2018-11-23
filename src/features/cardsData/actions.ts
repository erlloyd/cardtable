import { CardData } from 'src/external-api/rings-db';
import { createAction } from 'typesafe-actions';

export const startLoadCardMetadata = createAction('cardsData/START_LOAD_CARD_METADATA', resolve => {
  return (id: number) => resolve({id});
});

export const receivedCardMetadata = createAction('cardsData/RECEIVED_CARD_METADATA', resolve => {
  return (id: number, metadata: CardData) => resolve({id, metadata});
});

export const loadCardMetadataFailed = createAction('cardsData/LOAD_CARD_METADATA_FAILED', resolve => {
  return (id: number, error: Error) => resolve({id, error});
});