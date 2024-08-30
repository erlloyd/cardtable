import {
  StatusTokenType,
  CounterTokenType,
  CardAttachLocation,
} from "../../constants/card-constants";
import { GameProperties } from "../GameModule";

export const properties: GameProperties = {
  heroImageUrl: "https://wallpapercave.com/wp/wp12312606.jpg",
  deckSite: "arkhamdb.com",
  decklistApi: "https://arkhamdb.com/api/public/decklist/",
  allowSpecificCardSearch: true,
  privateDecklistApi: "https://arkhamdb.com/api/public/deck/",
  decklistSearchApi: "",
  decklistSearchApiConstants: "",
  encounterUiName: "Encounter Set",
  initialPlaymatImageLocation: "https://wallpapercave.com/wp/wp12312620.jpg",
  possibleIcons: [],
  modifiers: [
    {
      attributeId: "thwart",
      attributeName: "Thwart",
      icon: "/images/standard/marvel/thwart.png",
      slot: 1,
    },
    {
      attributeId: "attack",
      attributeName: "Attack",
      icon: "/images/standard/marvel/attack.png",
      slot: 2,
    },
    {
      attributeId: "defense",
      attributeName: "Defense",
      icon: "/images/standard/marvel/defense.png",
      slot: 3,
    },
    {
      attributeId: "hitpoints",
      attributeName: "Hit Points",
      icon: "/images/standard/lotr/hitpoints.png",
      slot: 4,
    },
  ],
  tokens: {
    stunned: {
      canStackMultiple: true,
      tokenType: StatusTokenType.Stunned,
      touchMenuLetter: null,
      menuText: "Stun",
      menuRemoveText: "Remove Stun",
      imagePath: "/images/standard/stunned.png",
    },
    confused: {
      canStackMultiple: true,
      tokenType: StatusTokenType.Confused,
      touchMenuLetter: null,
      menuText: "Confuse",
      menuRemoveText: "Remove Confuse",
      imagePath: "/images/standard/confused.png",
    },
    tough: {
      canStackMultiple: true,
      tokenType: StatusTokenType.Tough,
      touchMenuLetter: null,
      menuText: "Tough",
      menuRemoveText: "Remove Tough",
      imagePath: "/images/standard/tough.png",
    },
    damage: {
      counterTokenType: CounterTokenType.Damage,
      isNumeric: true,
      touchMenuLetter: "Dmg",
      menuText: "Set Damage",
      imagePath: "/images/standard/damage.png",
    },
    threat: {
      counterTokenType: CounterTokenType.Threat,
      isNumeric: true,
      touchMenuLetter: "Thr",
      menuText: "Set Threat",
      imagePath: "/images/standard/threat.png",
    },
    generic: {
      counterTokenType: CounterTokenType.Generic,
      isNumeric: true,
      touchMenuLetter: "Gen",
      menuText: "Set Generic Tokens",
      imagePath: "/images/standard/generic_counter.png",
    },
    acceleration: {
      counterTokenType: CounterTokenType.Acceleration,
      isNumeric: true,
      touchMenuLetter: "Accel",
      menuText: "Set Acceleration Tokens",
      imagePath: "/images/standard/acceleration.png",
    },
  },
  defaultAttachLocation: CardAttachLocation.DownAndLeft,
  additionalResourcesUris: [
    { url: "https://arkhamdb.com/", display: "ArkhamDB" },
    { url: "https://hallofarkham.com/", display: "Hall of Arkham" },
    {
      url: "https://images-cdn.fantasyflightgames.com/filer_public/c4/b0/c4b0d66c-d79e-411b-bdb5-b5d8c457d4bc/ahc01_rules_reference_web.pdf",
      display: "Rules Reference (PDF)",
    },
  ],
  tokenBags: [
    {
      id: "",
      code: "chaosBag",
      quantity: 1,
      bagImgUrl:
        "https://play-lh.googleusercontent.com/JEbONh12jcLUgJeF0XSpFo8ihbvqG29ljZlYEx3EHuRgJwX6SgIlpAGMnO-5CgPbXY8",
      position: { x: 0, y: 0 },
      tokens: [
        {
          code: "+1",
          name: "+1",
          currentNumberInBag: 0,
          frontImgUrl:
            "https://ik.imagekit.io/cardtable/arkham_horror_card_game/tokens/token_+1.png",
        },
        {
          code: "0",
          name: "0",
          currentNumberInBag: 0,
          frontImgUrl:
            "https://ik.imagekit.io/cardtable/arkham_horror_card_game/tokens/token_0.png",
        },
        {
          code: "-1",
          name: "-1",
          currentNumberInBag: 0,
          frontImgUrl:
            "https://ik.imagekit.io/cardtable/arkham_horror_card_game/tokens/token_-1.png",
        },
        {
          code: "-2",
          name: "-2",
          currentNumberInBag: 0,
          frontImgUrl:
            "https://ik.imagekit.io/cardtable/arkham_horror_card_game/tokens/token_-2.png",
        },
        {
          code: "-3",
          name: "-3",
          currentNumberInBag: 0,
          frontImgUrl:
            "https://ik.imagekit.io/cardtable/arkham_horror_card_game/tokens/token_-3.png",
        },
        {
          code: "-4",
          name: "-4",
          currentNumberInBag: 0,
          frontImgUrl:
            "https://ik.imagekit.io/cardtable/arkham_horror_card_game/tokens/token_-4.png",
        },
        {
          code: "-5",
          name: "-5",
          currentNumberInBag: 0,
          frontImgUrl:
            "https://ik.imagekit.io/cardtable/arkham_horror_card_game/tokens/token_-5.png",
        },
        {
          code: "-6",
          name: "-6",
          currentNumberInBag: 0,
          frontImgUrl:
            "https://ik.imagekit.io/cardtable/arkham_horror_card_game/tokens/token_-6.png",
        },
        {
          code: "-7",
          name: "-7",
          currentNumberInBag: 0,
          frontImgUrl:
            "https://ik.imagekit.io/cardtable/arkham_horror_card_game/tokens/token_-7.png",
        },
        {
          code: "-8",
          name: "-8",
          currentNumberInBag: 0,
          frontImgUrl:
            "https://ik.imagekit.io/cardtable/arkham_horror_card_game/tokens/token_-8.png",
        },
        {
          code: "fail",
          name: "Auto-fail",
          currentNumberInBag: 0,
          frontImgUrl:
            "https://ik.imagekit.io/cardtable/arkham_horror_card_game/tokens/token_fail.png",
        },
        {
          code: "eldersign",
          name: "Elder sign",
          currentNumberInBag: 0,
          frontImgUrl:
            "https://ik.imagekit.io/cardtable/arkham_horror_card_game/tokens/token_elder_sign.png",
        },
        {
          code: "skull",
          name: "Skull",
          currentNumberInBag: 0,
          frontImgUrl:
            "https://ik.imagekit.io/cardtable/arkham_horror_card_game/tokens/token_skull.png",
        },
        {
          code: "tablet",
          name: "Tablet",
          currentNumberInBag: 0,
          frontImgUrl:
            "https://ik.imagekit.io/cardtable/arkham_horror_card_game/tokens/token_tablet.png",
        },
        {
          code: "elderthing",
          name: "Elder Thing",
          currentNumberInBag: 0,
          frontImgUrl:
            "https://ik.imagekit.io/cardtable/arkham_horror_card_game/tokens/token_elderthing.png",
        },
        {
          code: "cultist",
          name: "Cultist",
          currentNumberInBag: 0,
          frontImgUrl:
            "https://ik.imagekit.io/cardtable/arkham_horror_card_game/tokens/token_cultist.png",
        },
        {
          code: "frost",
          name: "Frost",
          currentNumberInBag: 0,
          frontImgUrl:
            "https://ik.imagekit.io/cardtable/arkham_horror_card_game/tokens/token_frost.png",
        },
        {
          code: "bless",
          name: "Bless",
          currentNumberInBag: 0,
          frontImgUrl:
            "https://ik.imagekit.io/cardtable/arkham_horror_card_game/tokens/token_bless.png",
        },
        {
          code: "curse",
          name: "Curse",
          currentNumberInBag: 0,
          frontImgUrl:
            "https://ik.imagekit.io/cardtable/arkham_horror_card_game/tokens/token_curse.png",
        },
      ],
    },
  ],
};
