import log from "loglevel";
import { myPeerRef } from "../constants/app-constants";
import { StatusTokenType } from "../constants/card-constants";
import {
  CARD_ALREADY_ROTATED_MAP,
  FORCE_CARD_BACK_MAP,
  FORCE_ENCOUNTER_CARD_BACK_MAP,
  MISSING_CARD_IMAGE_MAP,
} from "../constants/card-missing-image-map";
import { CardData } from "../external-api/common-card-data";
import { ICardData } from "../features/cards-data/initialState";
import { ICardStack } from "../features/cards/initialState";
import { GameType } from "../game-modules/GameType";
import GameManager from "../game-modules/GameModuleManager";

export const anyCardStackHasStatus = (
  status: StatusTokenType,
  stacks: ICardStack[]
) => {
  return stacks.length > 0 && stacks.some((s) => s.statusTokens[status]);
};

export const getMySelectedCards = (stacks: ICardStack[]) => {
  return stacks.filter((c) => c.selected && c.controlledBy === myPeerRef);
};

const checkMissingImageMap = (
  gameType: GameType,
  code: string
): string | null => {
  const missingImageMapForGame = MISSING_CARD_IMAGE_MAP[gameType];

  if (missingImageMapForGame === null) return null;

  return missingImageMapForGame[code] ?? null;
};

const generateLCGCDNImageUrl = (
  currentGameType: GameType,
  card: CardData,
  faceup: boolean
): string => {
  if (!card) {
    return `https://lcgcdn.s3.amazonaws.com/mc/NOPE.jpg`;
  }

  // get the first two digits
  let codeToUse = card.code;

  if (!faceup && !!card.backLink) {
    codeToUse = card.backLink;
  }

  const groupCode =
    GameManager.getModuleForType(currentGameType).remappedPacks[
      card.extraInfo.packCode ?? ""
    ] ?? codeToUse.substring(0, 2);
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

export const cacheImages = async (imgUrls: string[]) => {
  const promises = imgUrls.map(
    (src) =>
      new Promise((resolve, reject) => {
        const img = new Image();
        img.src = src;
        img.onload = () => {
          log.debug("loaded img for cache: " + img.src);
          resolve(1);
        };
        img.onerror = () => {
          log.debug("errored loading img for cache" + img.src);
          reject();
        };
      })
  );

  return Promise.all(promises);
};

export const getImgUrls = (
  card: ICardStack,
  cardsData: ICardData,
  currentGameType: GameType
): string[] =>
  getImgUrlsFromJsonId(
    card.cardStack[0].jsonId,
    card.faceup,
    cardsData,
    currentGameType
  );

export const getImgUrlsFromJsonId = (
  cardJsonId: string,
  faceup: boolean,
  cardsData: ICardData,
  currentGameType: GameType
): string[] => {
  if (Object.keys(cardsData).length === 0) return [];

  let urls: string[] = [];

  const topCardData = cardsData[cardJsonId];

  if (!topCardData) {
    return [];
  }

  let cardData: CardData | null = topCardData;

  if (!!cardData.images) {
    if (!faceup) {
      if (!cardData.images.back) {
        const defaultBack =
          FORCE_CARD_BACK_MAP[topCardData.code] ||
          "/images/standard/card_back_" + currentGameType + ".png";

        return [
          topCardData.extraInfo.factionCode === "encounter" ||
          topCardData.typeCode === "side_scheme" ||
          FORCE_ENCOUNTER_CARD_BACK_MAP[topCardData.code]
            ? "/images/standard/encounter_card_back_" + currentGameType + ".png"
            : defaultBack,
        ];
      } else {
        const back =
          FORCE_CARD_BACK_MAP[topCardData.code] || cardData.images.back;
        return [back];
      }
    } else {
      return [cardData.images.front];
    }
  }

  if (!faceup) {
    if (!!topCardData.backLink || !!topCardData.doubleSided) {
      urls = [
        generateLCGCDNImageUrl(currentGameType, topCardData, faceup),
        // `https://marvelcdb.com/bundles/cards/${bottomCardData.back_link}.png`,
        // `https://marvelcdb.com/bundles/cards/${bottomCardData.back_link}.jpg`,
        //
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
          ? "/images/standard/encounter_card_back_" + currentGameType + ".png"
          : "/images/standard/card_back_" + currentGameType + ".png",
      ];
    }
  } else {
    urls = [
      generateLCGCDNImageUrl(currentGameType, topCardData, faceup),
      // `https://marvelcdb.com/bundles/cards/${topCardData.code}.png`,
      // `https://marvelcdb.com/bundles/cards/${topCardData.code}.jpg`,
      //
      //   "/images/cards/" +
      //   topCardData.octgn_id +
      //   ".jpg",
    ];
  }

  let codeForMissingCheck = "";

  if (!!cardData) {
    if (faceup) {
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
    ? checkMissingImageMap(currentGameType, codeForMissingCheck)
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
