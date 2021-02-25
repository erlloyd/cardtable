// tslint:disable-next-line:interface-name
export interface CardStatsData {
  ResourceCost?: string;
  Willpower?: string;
  EngagementCost?: string;
  Threat?: string;
  Attack?: string;
  Defense?: string;
  HitPoints?: string;
  StageNumber?: string;
  QuestPoints?: string;
}

// tslint:disable-next-line:interface-name
export interface CardFaceData {
  Subtitle: string | null;
  ImagePath: string;
  Stats: CardStatsData | null;
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
  Slug: string;
  IsUnique: boolean;
  CardType: string; // TODO make an enum?
  CardSubType: string;
  Sphere: string | null;
  Front: CardFaceData;
  Back: CardFaceData | null;
  CardSet: string;
  EncounterInfo: CardEncounterData | null;
  Number: number;
  Quantity: number;
  Artist: string;
  HasErrata: boolean;
  OctgnGuid: string;
  RingsDbCardId: string;
  RingsDbPopularity: number;
  RingsDbVotes: number;
  Categories: any | null;
}

export interface CardPack {
  Abbreviation: string;
  Cycle: string;
  Name: string;
  SetType: string;
  cards: CardData[];
}

export interface ScenarioCard {
  EncounterSet: string;
  Title: string;
  Slug: string;
  NormalQuantity: number;
  EasyQuantity: number;
  NightmareQuantity: number;
}

export interface Scenario {
  Title: string;
  Slug: string;
  Product: string;
  Number: number;
  AllCards: CardData[];
}
