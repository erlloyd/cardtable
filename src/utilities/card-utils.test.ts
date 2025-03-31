import { describe, it, expect } from "vitest";
import { StatusTokenType } from "../constants/card-constants";
import { ICardStack } from "../features/cards/initialState";
import { ICardData } from "../features/cards-data/initialState";

import {
  anyCardStackHasStatus,
  getMySelectedCards,
  shouldRenderImageHorizontal,
  getCardTypeWithoutStack,
  makeFakeCardStackFromJsonId,
  getImgUrlsFromJsonId,
} from "./card-utils";
import { createDefaultCardStack } from "./test-utils";
import { myPeerRef } from "../constants/app-constants";
import { GameType } from "../game-modules/GameType";

describe("anyCardStackHasStatus", () => {
  it("should return true if any card stack has the specified status", () => {
    const stacks: ICardStack[] = [
      createDefaultCardStack({
        statusTokens: {
          stunned: 1,
          confused: 0,
          tough: 0,
        },
      }), // Default stack with no status tokens
    ];
    expect(anyCardStackHasStatus(StatusTokenType.Stunned, stacks)).toBe(true);
  });

  it("should return false if no card stack has the specified status", () => {
    const stacks: ICardStack[] = [
      createDefaultCardStack(), // Default stack with no status tokens
    ];
    expect(anyCardStackHasStatus(StatusTokenType.Stunned, stacks)).toBe(false);
  });

  it("should return false if stacks array is empty", () => {
    expect(anyCardStackHasStatus(StatusTokenType.Stunned, [])).toBe(false);
  });
});

describe("getMySelectedCards", () => {
  it("should return only the cards controlled by myPeerRef and selected", () => {
    const stacks: ICardStack[] = [
      createDefaultCardStack(),
      createDefaultCardStack(),
      createDefaultCardStack(),
    ];

    stacks[0].controlledBy = myPeerRef; // This stack is controlled by myPeerRef
    stacks[0].selected = true; // This stack is selected
    stacks[1].controlledBy = "otherPeerRef"; // This stack is controlled by another peer
    stacks[1].selected = true; // This stack is selected but not controlled by myPeerRef
    expect(getMySelectedCards(stacks).length).toEqual(1);
  });

  it("should return an empty array if no cards match the criteria", () => {
    const stacks: ICardStack[] = [
      createDefaultCardStack(),
      createDefaultCardStack(),
      createDefaultCardStack(),
    ];
    expect(getMySelectedCards(stacks)).toEqual([]);
  });
});

describe("shouldRenderImageHorizontal", () => {
  it("should return true if the card should be rendered horizontally", () => {
    const result = shouldRenderImageHorizontal(
      "code1",
      "type1",
      ["type1"],
      false
    );
    expect(result).toBe(true);
  });

  it("should return false if the card should not be rendered horizontally", () => {
    const result = shouldRenderImageHorizontal(
      "code2",
      "type2",
      ["type3"],
      true
    );
    expect(result).toBe(false);
  });
});

describe("getCardTypeWithoutStack", () => {
  it("should return the card type in lowercase", () => {
    const cardsData: ICardData = {
      jsonId1: {
        typeCode: "ally",
        backLink: null,
        code: "",
        name: "",
        images: null,
        octgnId: null,
        quantity: 0,
        doubleSided: false,
        subTypeCode: null,
        extraInfo: {
          campaign: undefined,
          setCode: null,
          packCode: null,
          factionCode: null,
          setType: undefined,
          sizeType: undefined,
          setPosition: undefined,
          loadOrder: undefined,
        },
      },
    };
    const result = getCardTypeWithoutStack("jsonId1", true, cardsData);
    expect(result).toBe("ally");
  });

  it("should return an empty string if cardsData is empty", () => {
    const result = getCardTypeWithoutStack("jsonId1", true, {});
    expect(result).toBe("");
  });
});

describe("makeFakeCardStackFromJsonId", () => {
  it("should create a fake card stack with the given jsonId", () => {
    const jsonId = "testJsonId";
    const result = makeFakeCardStackFromJsonId(jsonId);
    expect(result.cardStack[0].jsonId).toBe(jsonId);
    expect(result.controlledBy).toBe(myPeerRef);
  });
});
describe("getImgUrlsFromJsonId", () => {
  it("should return empty array when cardsData is empty", () => {
    const result = getImgUrlsFromJsonId("any-id", true, {}, "mc" as GameType);
    expect(result).toEqual([]);
  });

  it("should return empty array when cardJsonId doesn't exist in cardsData", () => {
    const cardsData = {
      "existing-id": {
        code: "123",
        typeCode: "hero",
        backLink: null,
        name: "Test Card",
        images: null,
        octgnId: null,
        quantity: 1,
        doubleSided: false,
        subTypeCode: null,
        extraInfo: {
          factionCode: null,
          packCode: null,
          setCode: null,
        },
      },
    };
    const result = getImgUrlsFromJsonId(
      "non-existing-id",
      true,
      cardsData,
      "mc" as GameType
    );
    expect(result).toEqual([]);
  });

  it("should return front image URL when card has images and is faceup", () => {
    const cardsData = {
      "card-with-images": {
        code: "123",
        typeCode: "hero",
        backLink: null,
        name: "Test Card",
        images: {
          front: "/images/front.jpg",
          back: "/images/back.jpg",
        },
        octgnId: null,
        quantity: 1,
        doubleSided: false,
        subTypeCode: null,
        extraInfo: {
          factionCode: null,
          packCode: null,
          setCode: null,
        },
      },
    };
    const result = getImgUrlsFromJsonId(
      "card-with-images",
      true,
      cardsData,
      "mc" as GameType
    );
    expect(result).toEqual(["/images/front.jpg"]);
  });

  it("should return back image URL when card has images and is facedown", () => {
    const cardsData = {
      "card-with-images": {
        code: "123",
        typeCode: "hero",
        backLink: null,
        name: "Test Card",
        images: {
          front: "/images/front.jpg",
          back: "/images/back.jpg",
        },
        octgnId: null,
        quantity: 1,
        doubleSided: false,
        subTypeCode: null,
        extraInfo: {
          factionCode: null,
          packCode: null,
          setCode: null,
        },
      },
    };
    const result = getImgUrlsFromJsonId(
      "card-with-images",
      false,
      cardsData,
      "mc" as GameType
    );
    expect(result).toEqual(["/images/back.jpg"]);
  });

  it("should use default card back when card has images but no back image and is facedown", () => {
    const cardsData = {
      "card-without-back": {
        code: "123",
        typeCode: "hero",
        backLink: null,
        name: "Test Card",
        images: {
          front: "/images/front.jpg",
          back: null,
        },
        octgnId: null,
        quantity: 1,
        doubleSided: false,
        subTypeCode: null,
        extraInfo: {
          factionCode: null,
          packCode: null,
          setCode: null,
        },
      },
    };
    const result = getImgUrlsFromJsonId(
      "card-without-back",
      false,
      cardsData,
      "mc" as GameType
    );
    expect(result[0]).toContain("/images/standard/card_back_mc.png");
  });

  it("should use encounter card back for encounter cards when facedown", () => {
    const cardsData = {
      "encounter-card": {
        code: "456",
        typeCode: "treachery",
        backLink: null,
        name: "Encounter Card",
        images: {
          front: "/images/encounter-front.jpg",
          back: null,
        },
        octgnId: null,
        quantity: 1,
        doubleSided: false,
        subTypeCode: null,
        extraInfo: {
          factionCode: "encounter",
          packCode: null,
          setCode: null,
        },
      },
    };
    const result = getImgUrlsFromJsonId(
      "encounter-card",
      false,
      cardsData,
      "mc" as GameType
    );
    expect(result[0]).toContain("/images/standard/encounter_card_back_mc.png");
  });

  it("should use Cerebro URL for faceup cards without images property", () => {
    const cardsData = {
      "card-without-images": {
        code: "789",
        typeCode: "hero",
        backLink: null,
        name: "Normal Card",
        images: null,
        octgnId: null,
        quantity: 1,
        doubleSided: false,
        subTypeCode: null,
        extraInfo: {
          factionCode: null,
          packCode: null,
          setCode: null,
        },
      },
    };
    const result = getImgUrlsFromJsonId(
      "card-without-images",
      true,
      cardsData,
      GameType.MarvelChampions
    );
    expect(result[0]).toContain("cerebrodatastorage.blob.core.windows.net");
    expect(result[0]).toContain("789");
  });

  it("should use Cerebro URL for double-sided cards when facedown", () => {
    const cardsData = {
      "double-sided-card": {
        code: "101",
        typeCode: "hero",
        backLink: null,
        name: "Double Sided",
        images: null,
        octgnId: null,
        quantity: 1,
        doubleSided: true,
        subTypeCode: null,
        extraInfo: {
          factionCode: null,
          packCode: null,
          setCode: null,
        },
      },
    };
    const result = getImgUrlsFromJsonId(
      "double-sided-card",
      false,
      cardsData,
      GameType.MarvelChampions
    );
    expect(result[0]).toContain("cerebrodatastorage.blob.core.windows.net");
  });

  it("should use Cerebro URL for cards with backLink when facedown", () => {
    const cardsData = {
      "card-with-backlink": {
        code: "202",
        typeCode: "hero",
        backLink: "303",
        name: "Card with Backlink",
        images: null,
        octgnId: null,
        quantity: 1,
        doubleSided: false,
        subTypeCode: null,
        extraInfo: {
          factionCode: null,
          packCode: null,
          setCode: null,
        },
      },
    };
    const result = getImgUrlsFromJsonId(
      "card-with-backlink",
      false,
      cardsData,
      GameType.MarvelChampions
    );
    expect(result[0]).toContain("cerebrodatastorage.blob.core.windows.net");
  });
});
