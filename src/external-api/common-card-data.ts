import { CardSizeType } from "../constants/card-constants";

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
    setType?: string | null;
    sizeType?: CardSizeType;
    setPosition?: number;
  };
  duplicate_of?: string;
  customCard?: boolean;
}
