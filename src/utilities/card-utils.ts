import log from "loglevel";
import { myPeerRef } from "../constants/app-constants";
import { CardSizeType, StatusTokenType } from "../constants/card-constants";
import {
  CARD_ALREADY_ROTATED_MAP,
  CARD_SHOULD_BE_HORIZONTAL_MAP,
  FORCE_CARD_BACK_MAP,
  FORCE_ENCOUNTER_CARD_BACK_MAP,
  MISSING_CARD_IMAGE_MAP,
} from "../constants/card-missing-image-map";
import { CardData } from "../external-api/common-card-data";
import { ICardData } from "../features/cards-data/initialState";
import { ICardStack } from "../features/cards/initialState";
import { GameType } from "../game-modules/GameType";
import GameManager from "../game-modules/GameModuleManager";
import { v4 } from "uuid";

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

const cardsWithValidExtensions: { [key: string]: boolean } = {
  "01043A": true,
  "01043B": true,
  "01043C": true,
  "01043D": true,
  "45179A": true,
  "45179B": true,
  "45180A": true,
  "45180B": true,
  "45181A": true,
  "45181B": true,
  "45182A": true,
  "45182B": true,
  "45183A": true,
  "45183B": true,
  "47010A": true,
  "47010B": true,
  "47010C": true,
  "47007B": true,
  "47008B": true,
  "50184B": true,
};

const generateCerebroImageUrl = (
  _currentGameType: GameType,
  card: CardData,
  faceup: boolean
): string => {
  if (!card) {
    return `https://lcgcdn.s3.amazonaws.com/mc/NOPE.jpg`;
  }

  const backLink = card.backLink || card.code;

  let codeToUse = faceup ? card.code.toUpperCase() : backLink.toUpperCase();
  let suffix = "";

  if (!cardsWithValidExtensions[codeToUse]) {
    const potentialSuffix = faceup ? "A" : "B";
    let alreadyHasSuffix = codeToUse?.endsWith("A") || codeToUse?.endsWith("B");
    const hasCorrectSuffix = codeToUse?.endsWith(potentialSuffix);

    if (alreadyHasSuffix && !hasCorrectSuffix && codeToUse) {
      codeToUse = codeToUse.slice(0, codeToUse.length - 1);
      alreadyHasSuffix = false;
    }

    if (!alreadyHasSuffix && !!card.doubleSided) {
      suffix = potentialSuffix;
    }
  }
  const imgUrlToGrab = `https://cerebrodatastorage.blob.core.windows.net/cerebro-cards/official/${codeToUse}${suffix}.jpg`;
  return imgUrlToGrab;
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
    card.faceup || (!card.faceup && card.topCardFaceup),
    cardsData,
    currentGameType
  );

export const getImgUrlsFromJsonId = (
  cardJsonId: string,
  faceup: boolean,
  cardsData: ICardData,
  currentGameTypeParam: GameType | null
): string[] => {
  const currentGameType =
    currentGameTypeParam ?? (GameManager.allRegisteredGameTypes[0] as GameType);

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
          (topCardData.extraInfo.factionCode === "encounter" &&
            topCardData.typeCode !== "ally") ||
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
      urls = [generateCerebroImageUrl(currentGameType, topCardData, faceup)];
    } else {
      cardData = null;
      urls = [
        (topCardData.extraInfo.factionCode === "encounter" &&
          topCardData.typeCode !== "ally") ||
        topCardData.typeCode === "side_scheme" ||
        topCardData.typeCode === "minion" ||
        topCardData.typeCode === "treachery" ||
        FORCE_ENCOUNTER_CARD_BACK_MAP[topCardData.code]
          ? "/images/standard/encounter_card_back_" + currentGameType + ".png"
          : "/images/standard/card_back_" + currentGameType + ".png",
      ];
    }
  } else {
    urls = [generateCerebroImageUrl(currentGameType, topCardData, faceup)];
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
  return (
    CARD_SHOULD_BE_HORIZONTAL_MAP[code] ||
    (shouldRotateByType && !CARD_ALREADY_ROTATED_MAP[code])
  );
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

export const makeFakeCardStackFromJsonId = (jsonId: string): ICardStack => {
  return {
    controlledBy: myPeerRef,
    dragging: false,
    shuffling: false,
    exhausted: false,
    faceup: true,
    topCardFaceup: false,
    fill: "anything",
    id: v4(),
    selected: false,
    x: 0,
    y: 0,
    cardStack: [{ jsonId }],
    statusTokens: {
      stunned: 0,
      confused: 0,
      tough: 0,
    },
    counterTokensList: [],
    modifiers: {},
    extraIcons: [],
    sizeType: CardSizeType.Standard,
  };
};
