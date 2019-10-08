import { CardData } from 'src/external-api/beorn-json-data';

export interface ICardMetadataState {
  metadata: CardData[];
}

const state: ICardMetadataState = {
  metadata: []
}; 

export default state;