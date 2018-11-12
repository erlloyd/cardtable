import { createAction } from 'typesafe-actions';

export const loadCardMetadata = createAction('cards/LOAD_CARD_METADATA', resolve => {
  return (id: number) => resolve({id});
});