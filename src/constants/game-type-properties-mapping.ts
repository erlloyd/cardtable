import { GameType } from "./app-constants";

export interface GameProperties {
  deckSite: string;
  decklistApi: string;
  encounterUiName: string;
  backgroundImageLocation: string;
  tokens: {
    stunned: TokenInfo | null;
    confused: TokenInfo | null;
    tough: TokenInfo | null;
    damage: NumericTokenInfo | null;
    threat: NumericTokenInfo | null;
    generic: NumericTokenInfo | null;
  };
}

export interface NumericTokenInfo {
  menuText: string;
  imagePath: string;
}

export interface TokenInfo {
  menuText: string;
  menuRemoveText: string;
  imagePath: string;
}

export const GamePropertiesMap: { [key in GameType]: GameProperties } = {
  marvelchampions: {
    deckSite: "marvelcdb.com",
    decklistApi: "https://marvelcdb.com/api/public/decklist/",
    encounterUiName: "Encounter Set",
    backgroundImageLocation: "/images/table/background_marvelchampions.png",
    tokens: {
      stunned: {
        menuText: "Stun",
        menuRemoveText: "Remove Stun",
        imagePath: process.env.PUBLIC_URL + "/images/standard/stunned.png",
      },
      confused: {
        menuText: "Confuse",
        menuRemoveText: "Remove Confuse",
        imagePath: process.env.PUBLIC_URL + "/images/standard/confused.png",
      },
      tough: {
        menuText: "Tough",
        menuRemoveText: "Remove Tough",
        imagePath: process.env.PUBLIC_URL + "/images/standard/tough.png",
      },
      damage: {
        menuText: "Set Damage",
        imagePath: process.env.PUBLIC_URL + "/images/standard/damage.png",
      },
      threat: {
        menuText: "Set Threat",
        imagePath: process.env.PUBLIC_URL + "/images/standard/threat.png",
      },
      generic: {
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
    backgroundImageLocation: "/images/table/background_lotrlcg.jpg",
    tokens: {
      stunned: {
        menuText: "Quest",
        menuRemoveText: "Remove From Quest",
        imagePath: process.env.PUBLIC_URL + "/images/standard/quest.png",
      },
      confused: null,
      tough: null,
      damage: {
        menuText: "Set Damage",
        imagePath: process.env.PUBLIC_URL + "/images/standard/damage_lotr.png",
      },
      threat: {
        menuText: "Set Progress",
        imagePath: process.env.PUBLIC_URL + "/images/standard/progress.png",
      },
      generic: {
        menuText: "Set Resource Tokens",
        imagePath: process.env.PUBLIC_URL + "/images/standard/resource.png",
      },
    },
  },
};
