export interface ICardMetadata {
  id: string;
  loading: boolean;
}

export interface ICardMetadataMap {
  [s: string]: ICardMetadata
};

// Map from id to metadata
export interface ICardMetadataState {
  loading: boolean
  metadata: ICardMetadataMap
}

const state: ICardMetadataState = {
  loading: false,
  metadata: {}
}; 

export default state;