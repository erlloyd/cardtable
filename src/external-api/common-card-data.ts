export interface CardData {
  code: string;
  name: string;
  images: {
    front: string;
    back: string | null;
  } | null;
  octgnId: string | null;
  quantity: number;
  doubleSided: boolean;
  backLink: string | null;
  typeCode: string;
  subTypeCode: string | null;
  extraInfo: {
    campaign?: boolean;
    setCode: string | null;
    packCode: string | null;
    factionCode: string | null;
  };
  duplicate_of?: string;
}
