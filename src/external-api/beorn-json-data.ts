// tslint:disable-next-line:interface-name
export interface CardStatsData {
  EngagementCost: string;
  Threat: string;
  Attack: string;
  Defense: string;
  HitPoints: string;
}

// tslint:disable-next-line:interface-name
export interface CardFaceData {
  Subtitle: string | null;
  ImagePath: string;
  Stats: CardStatsData;
  Traits: string[];
  Keywords: string[];
  Text: string[];
  Shadow: string | null;
  FlavorText: string | null;
}

// tslint:disable-next-line:interface-name
export interface CardEncounterData {
  EncounterSet: string;
  EasyModeQuantity: number;
  IncludedEncounterSets: any[];
  StageNumber: number | null;
  StageLetter: string | null;
}

// tslint:disable-next-line:interface-name
export interface CardData {
  Title: string;
  IsUnique: boolean;
  CardType: string; // TODO make an enum?
  CardSubType: string;
  Sphere: string;
  Front: CardFaceData;
  Back: CardFaceData | null;
  CardSet: string;
  EncounterInfo: CardEncounterData | null;
  Number: number;
  Qunatity: number;
  Artist: string;
  HasErrata: boolean;
  Categories: any | null;
}