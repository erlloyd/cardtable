import { GameType } from "./app-constants";

export interface GameProperties {
  deckSite: string;
  decklistApi: string;
  encounterUiName: string;
  tokens: {
    stunned: TokenInfo | null;
    confused: TokenInfo | null;
    tough: TokenInfo | null;
  };
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
    },
  },
  lotrlcg: {
    deckSite: "ringsdb.com",
    decklistApi: "https://ringsdb.com/api/public/decklist/",
    encounterUiName: "Scenario",
    tokens: {
      stunned: {
        menuText: "Quest",
        menuRemoveText: "Remove From Quest",
        imagePath: process.env.PUBLIC_URL + "/images/standard/quest.png",
      },
      confused: null,
      tough: null,
    },
  },
};
