import { CardData } from 'src/external-api/rings-db';

export interface ICardMetadata {
  id: number;
  loading: boolean;
  data?: CardData;
  error?: Error;
}

export interface ICardMetadataMap {
  [n: number]: ICardMetadata
};

// Map from id to metadata
export interface ICardMetadataState {
  metadata: ICardMetadataMap;
}

const state: ICardMetadataState = {
  metadata: {}
}; 

export default state;