import { GameType, myPeerRef } from "../constants/app-constants";
import { StatusTokenType } from "../constants/card-constants";
import {
  CARD_ALREADY_ROTATED_MAP,
  FORCE_ENCOUNTER_CARD_BACK_MAP,
  MISSING_CARD_IMAGE_MAP,
} from "../constants/card-missing-image-map";
import { CARD_PACK_REMAPPING } from "../constants/card-pack-mapping";
import { CardData } from "../external-api/common-card-data";
import { ICardData } from "../features/cards-data/initialState";
import { ICardStack } from "../features/cards/initialState";

export const anyCardStackHasStatus = (
  status: StatusTokenType,
  stacks: ICardStack[]
) => {
  return stacks.length > 0 && stacks.some((s) => s.statusTokens[status]);
};

export const getMySelectedCards = (stacks: ICardStack[]) => {
  return stacks.filter((c) => c.selected && c.controlledBy === myPeerRef);
};

const checkMissingImageMap = (code: string): string | null => {
  return MISSING_CARD_IMAGE_MAP[code] ?? null;
};

const generateLCGCDNImageUrl = (card: CardData, faceup: boolean): string => {
  if (!card) {
    return `https://lcgcdn.s3.amazonaws.com/mc/NOPE.jpg`;
  }

  // get the first two digits
  let codeToUse = card.code;

  if (!faceup && !!card.backLink) {
    codeToUse = card.backLink;
  }

  const groupCode =
    CARD_PACK_REMAPPING[card.extraInfo.packCode ?? ""] ??
    codeToUse.substring(0, 2);
  let cardCode = codeToUse.substring(2);

  //trim leading "0" chars
  while (cardCode[0] === "0") {
    cardCode = cardCode.substring(1);
  }

  cardCode = cardCode.toLocaleUpperCase();

  let cardSuffix = "";

  if (!!card.doubleSided) {
    cardSuffix = faceup ? "A" : "B";
  }

  return `https://lcgcdn.s3.amazonaws.com/mc/MC${groupCode}en_${cardCode}${cardSuffix}.jpg`;
};

export const getImgUrls = (
  card: ICardStack,
  cardsData: ICardData,
  currentGameType: GameType
): string[] => {
  if (Object.keys(cardsData).length === 0) return [];

  let urls: string[] = [];

  const topCardData = cardsData[card.cardStack[0].jsonId];

  if (!topCardData) {
    return [];
  }

  let cardData: CardData | null = topCardData;

  if (!!cardData.images) {
    if (!card.faceup) {
      if (!cardData.images.back) {
        return [
          topCardData.extraInfo.factionCode === "encounter" ||
          topCardData.typeCode === "side_scheme" ||
          FORCE_ENCOUNTER_CARD_BACK_MAP[topCardData.code]
            ? process.env.PUBLIC_URL +
              "/images/standard/encounter_card_back_" +
              currentGameType +
              ".png"
            : process.env.PUBLIC_URL +
              "/images/standard/card_back_" +
              currentGameType +
              ".png",
        ];
      } else {
        return [cardData.images.back];
      }
    } else {
      return [cardData.images.front];
    }
  }

  if (!card.faceup) {
    if (!!topCardData.backLink || !!topCardData.doubleSided) {
      urls = [
        generateLCGCDNImageUrl(topCardData, card.faceup),
        // `https://marvelcdb.com/bundles/cards/${bottomCardData.back_link}.png`,
        // `https://marvelcdb.com/bundles/cards/${bottomCardData.back_link}.jpg`,
        // process.env.PUBLIC_URL +
        //   "/images/cards/" +
        //   bottomCardData.octgn_id +
        //   ".b.jpg",
      ];
    } else {
      cardData = null;
      urls = [
        topCardData.extraInfo.factionCode === "encounter" ||
        topCardData.typeCode === "side_scheme" ||
        FORCE_ENCOUNTER_CARD_BACK_MAP[topCardData.code]
          ? process.env.PUBLIC_URL +
            "/images/standard/encounter_card_back_" +
            currentGameType +
            ".png"
          : process.env.PUBLIC_URL +
            "/images/standard/card_back_" +
            currentGameType +
            ".png",
      ];
    }
  } else {
    urls = [
      generateLCGCDNImageUrl(topCardData, card.faceup),
      // `https://marvelcdb.com/bundles/cards/${topCardData.code}.png`,
      // `https://marvelcdb.com/bundles/cards/${topCardData.code}.jpg`,
      // process.env.PUBLIC_URL +
      //   "/images/cards/" +
      //   topCardData.octgn_id +
      //   ".jpg",
    ];
  }

  let codeForMissingCheck = "";

  if (!!cardData) {
    if (card.faceup) {
      codeForMissingCheck = cardData.code;
    } else {
      if (!!cardData.backLink) {
        codeForMissingCheck = cardData.backLink;
      } else if (cardData.doubleSided) {
        codeForMissingCheck = `${cardData.code}_double_sided_back`;
      }
    }
  }

  const missingImageOverride = !!cardData
    ? checkMissingImageMap(codeForMissingCheck)
    : null;

  if (!!missingImageOverride) {
    urls.unshift(missingImageOverride);
  }

  return urls;
};

export const shouldRenderImageHorizontal = (
  code: string,
  type: string,
  typeCodes: string[],
  plainCardBack: boolean
): boolean => {
  const shouldRotateByType =
    typeCodes.includes(type.toLocaleLowerCase()) && !plainCardBack;
  return shouldRotateByType && !CARD_ALREADY_ROTATED_MAP[code];
};

export const getCardTypeWithoutStack = (
  jsonId: string,
  faceup: boolean,
  cardsData: ICardData
): string => {
  if (Object.keys(cardsData).length === 0) return "";
  let cardData;
  const mainCardData = cardsData[jsonId];
  if (!!mainCardData) {
    cardData = mainCardData;
    if (!faceup && !!mainCardData.backLink) {
      cardData = cardsData[mainCardData.backLink];
    }
  }

  return (cardData?.typeCode ?? "").toLocaleLowerCase();
};

export const getCardType = (card: ICardStack, cardsData: ICardData): string =>
  getCardTypeWithoutStack(card.cardStack[0].jsonId, card.faceup, cardsData);
