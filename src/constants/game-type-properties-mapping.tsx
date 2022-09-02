import { GameType } from "./app-constants";
import { CounterTokenType, StatusTokenType } from "../constants/card-constants";

export interface GameProperties {
  deckSite: string;
  decklistApi: string;
  encounterUiName: string;
  backgroundImageLocation: string;
  possibleIcons: IconInfo[];
  modifiers: ModifierInfo[];
  tokens: {
    stunned: TokenInfo | null;
    confused: TokenInfo | null;
    tough: TokenInfo | null;
    damage: NumericTokenInfo | null;
    threat: NumericTokenInfo | null;
    generic: NumericTokenInfo | null;
  };
}

export interface TokenInfoBase {
  touchMenuLetter: string | null;
  menuText: string;
  imagePath: string;
}
export interface NumericTokenInfo extends TokenInfoBase {
  isNumeric: boolean;
  counterTokenType: CounterTokenType;
}

export interface TokenInfo extends TokenInfoBase {
  canStackMultiple: boolean;
  menuRemoveText: string;
  tokenType: StatusTokenType;
}

export interface ModifierInfo {
  attributeId: string;
  attributeName: string;
  icon: string;
  slot: number;
}

export interface IconInfo {
  iconId: string;
  iconName: string;
  iconImageUrl: string;
}

export const GamePropertiesMap: { [key in GameType]: GameProperties } = {
  marvelchampions: {
    deckSite: "marvelcdb.com",
    decklistApi: "https://marvelcdb.com/api/public/decklist/",
    encounterUiName: "Encounter Set",
    backgroundImageLocation:
      process.env.PUBLIC_URL + "/images/table/background_marvelchampions.png",
    possibleIcons: [],
    modifiers: [
      {
        attributeId: "thwart",
        attributeName: "Thwart",
        icon: process.env.PUBLIC_URL + "/images/standard/marvel/thwart.png",
        slot: 1,
      },
      {
        attributeId: "attack",
        attributeName: "Attack",
        icon: process.env.PUBLIC_URL + "/images/standard/marvel/attack.png",
        slot: 2,
      },
      {
        attributeId: "defense",
        attributeName: "Defense",
        icon: process.env.PUBLIC_URL + "/images/standard/marvel/defense.png",
        slot: 3,
      },
    ],
    tokens: {
      stunned: {
        canStackMultiple: true,
        tokenType: StatusTokenType.Stunned,
        touchMenuLetter: null,
        menuText: "Stun",
        menuRemoveText: "Remove Stun",
        imagePath: process.env.PUBLIC_URL + "/images/standard/stunned.png",
      },
      confused: {
        canStackMultiple: true,
        tokenType: StatusTokenType.Confused,
        touchMenuLetter: null,
        menuText: "Confuse",
        menuRemoveText: "Remove Confuse",
        imagePath: process.env.PUBLIC_URL + "/images/standard/confused.png",
      },
      tough: {
        canStackMultiple: true,
        tokenType: StatusTokenType.Tough,
        touchMenuLetter: null,
        menuText: "Tough",
        menuRemoveText: "Remove Tough",
        imagePath: process.env.PUBLIC_URL + "/images/standard/tough.png",
      },
      damage: {
        counterTokenType: CounterTokenType.Damage,
        isNumeric: true,
        touchMenuLetter: "Dmg",
        menuText: "Set Damage",
        imagePath: process.env.PUBLIC_URL + "/images/standard/damage.png",
      },
      threat: {
        counterTokenType: CounterTokenType.Threat,
        isNumeric: true,
        touchMenuLetter: "Thr",
        menuText: "Set Threat",
        imagePath: process.env.PUBLIC_URL + "/images/standard/threat.png",
      },
      generic: {
        counterTokenType: CounterTokenType.Generic,
        isNumeric: true,
        touchMenuLetter: "Gen",
        menuText: "Set Generic Tokens",
        imagePath:
          process.env.PUBLIC_URL + "/images/standard/generic_counter.png",
      },
    },
  },
  lotrlcg: {
    deckSite: "ringsdb.com",
    decklistApi: "https://ringsdb.com/api/public/decklist/",
    encounterUiName: "Scenario",
    backgroundImageLocation:
      process.env.PUBLIC_URL + "/images/table/background_lotrlcg.jpg",
    possibleIcons: [
      {
        iconId: "tactics",
        iconName: "Tactics",
        iconImageUrl:
          process.env.PUBLIC_URL + "/images/standard/lotr/tactics.png",
      },
      {
        iconId: "leadership",
        iconName: "Leadership",
        iconImageUrl:
          process.env.PUBLIC_URL + "/images/standard/lotr/leadership.png",
      },
      {
        iconId: "spirit",
        iconName: "Spirit",
        iconImageUrl:
          process.env.PUBLIC_URL + "/images/standard/lotr/spirit.png",
      },
      {
        iconId: "lore",
        iconName: "Lore",
        iconImageUrl: process.env.PUBLIC_URL + "/images/standard/lotr/lore.png",
      },
    ],
    modifiers: [
      {
        attributeId: "threat",
        attributeName: "Threat",
        icon: process.env.PUBLIC_URL + "/images/standard/lotr/threat.png",
        slot: 1,
      },
      {
        attributeId: "willpower",
        attributeName: "Willpower",
        icon: process.env.PUBLIC_URL + "/images/standard/lotr/willpower.png",
        slot: 2,
      },
      {
        attributeId: "attack",
        attributeName: "Attack",
        icon: process.env.PUBLIC_URL + "/images/standard/lotr/attack.png",
        slot: 3,
      },
      {
        attributeId: "defense",
        attributeName: "Defense",
        icon: process.env.PUBLIC_URL + "/images/standard/lotr/defense.png",
        slot: 4,
      },
      {
        attributeId: "hitpoints",
        attributeName: "Hit Points",
        icon: process.env.PUBLIC_URL + "/images/standard/lotr/hitpoints.png",
        slot: 5,
      },
    ],
    tokens: {
      stunned: {
        canStackMultiple: false,
        tokenType: StatusTokenType.Stunned,
        touchMenuLetter: "Q",
        menuText: "Quest",
        menuRemoveText: "Remove From Quest",
        imagePath: process.env.PUBLIC_URL + "/images/standard/quest.png",
      },
      confused: null,
      tough: null,
      damage: {
        counterTokenType: CounterTokenType.Damage,
        isNumeric: true,
        touchMenuLetter: "Dmg",
        menuText: "Set Damage",
        imagePath: process.env.PUBLIC_URL + "/images/standard/damage_lotr.png",
      },
      threat: {
        counterTokenType: CounterTokenType.Threat,
        isNumeric: true,
        touchMenuLetter: "Prg",
        menuText: "Set Progress",
        imagePath: process.env.PUBLIC_URL + "/images/standard/progress.png",
      },
      generic: {
        counterTokenType: CounterTokenType.Generic,
        isNumeric: true,
        touchMenuLetter: "Res",
        menuText: "Set Resource Tokens",
        imagePath: process.env.PUBLIC_URL + "/images/standard/resource.png",
      },
    },
  },
};
