import { GameType } from "./app-constants";
import * as React from "react";
import NewReleasesIcon from "@material-ui/icons/NewReleases";
import HelpIcon from "@material-ui/icons/Help";
import SecurityIcon from "@material-ui/icons/Security";
import { CounterTokenType, StatusTokenType } from "../constants/card-constants";

export interface GameProperties {
  deckSite: string;
  decklistApi: string;
  encounterUiName: string;
  backgroundImageLocation: string;
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
  touchMenuIcon: JSX.Element | null;
  menuText: string;
  imagePath: string;
}
export interface NumericTokenInfo extends TokenInfoBase {
  isNumeric: boolean;
  counterTokenType: CounterTokenType;
}

export interface TokenInfo extends TokenInfoBase {
  menuRemoveText: string;
  tokenType: StatusTokenType;
}

export interface ModifierInfo {
  attributeId: string;
  attributeName: string;
  icon: string;
}

export const GamePropertiesMap: { [key in GameType]: GameProperties } = {
  marvelchampions: {
    deckSite: "marvelcdb.com",
    decklistApi: "https://marvelcdb.com/api/public/decklist/",
    encounterUiName: "Encounter Set",
    backgroundImageLocation:
      process.env.PUBLIC_URL + "/images/table/background_marvelchampions.png",
    modifiers: [],
    tokens: {
      stunned: {
        tokenType: StatusTokenType.Stunned,
        touchMenuLetter: null,
        touchMenuIcon: <NewReleasesIcon fontSize="large"></NewReleasesIcon>,
        menuText: "Stun",
        menuRemoveText: "Remove Stun",
        imagePath: process.env.PUBLIC_URL + "/images/standard/stunned.png",
      },
      confused: {
        tokenType: StatusTokenType.Confused,
        touchMenuLetter: null,
        touchMenuIcon: <HelpIcon fontSize="large"></HelpIcon>,
        menuText: "Confuse",
        menuRemoveText: "Remove Confuse",
        imagePath: process.env.PUBLIC_URL + "/images/standard/confused.png",
      },
      tough: {
        tokenType: StatusTokenType.Tough,
        touchMenuLetter: null,
        touchMenuIcon: <SecurityIcon fontSize="large"></SecurityIcon>,
        menuText: "Tough",
        menuRemoveText: "Remove Tough",
        imagePath: process.env.PUBLIC_URL + "/images/standard/tough.png",
      },
      damage: {
        counterTokenType: CounterTokenType.Damage,
        isNumeric: true,
        touchMenuLetter: "D",
        touchMenuIcon: null,
        menuText: "Set Damage",
        imagePath: process.env.PUBLIC_URL + "/images/standard/damage.png",
      },
      threat: {
        counterTokenType: CounterTokenType.Threat,
        isNumeric: true,
        touchMenuLetter: "T",
        touchMenuIcon: null,
        menuText: "Set Threat",
        imagePath: process.env.PUBLIC_URL + "/images/standard/threat.png",
      },
      generic: {
        counterTokenType: CounterTokenType.Generic,
        isNumeric: true,
        touchMenuLetter: "G",
        touchMenuIcon: null,
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
    modifiers: [
      {
        attributeId: "willpower",
        attributeName: "Willpower",
        icon: process.env.PUBLIC_URL + "/images/standard/lotr/willpower.png",
      },
      {
        attributeId: "attack",
        attributeName: "Attack",
        icon: process.env.PUBLIC_URL + "/images/standard/lotr/attack.png",
      },
      {
        attributeId: "defense",
        attributeName: "Defense",
        icon: process.env.PUBLIC_URL + "/images/standard/lotr/defense.png",
      },
      {
        attributeId: "hitpoints",
        attributeName: "Hit Points",
        icon: process.env.PUBLIC_URL + "/images/standard/lotr/hitpoints.png",
      },
      {
        attributeId: "threat",
        attributeName: "Threat",
        icon: process.env.PUBLIC_URL + "/images/standard/lotr/threat.png",
      },
    ],
    tokens: {
      stunned: {
        tokenType: StatusTokenType.Stunned,
        touchMenuLetter: "Q",
        touchMenuIcon: null,
        menuText: "Quest",
        menuRemoveText: "Remove From Quest",
        imagePath: process.env.PUBLIC_URL + "/images/standard/quest.png",
      },
      confused: null,
      tough: null,
      damage: {
        counterTokenType: CounterTokenType.Damage,
        isNumeric: true,
        touchMenuLetter: "D",
        touchMenuIcon: null,
        menuText: "Set Damage",
        imagePath: process.env.PUBLIC_URL + "/images/standard/damage_lotr.png",
      },
      threat: {
        counterTokenType: CounterTokenType.Threat,
        isNumeric: true,
        touchMenuLetter: "P",
        touchMenuIcon: null,
        menuText: "Set Progress",
        imagePath: process.env.PUBLIC_URL + "/images/standard/progress.png",
      },
      generic: {
        counterTokenType: CounterTokenType.Generic,
        isNumeric: true,
        touchMenuLetter: "R",
        touchMenuIcon: null,
        menuText: "Set Resource Tokens",
        imagePath: process.env.PUBLIC_URL + "/images/standard/resource.png",
      },
    },
  },
};
