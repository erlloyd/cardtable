import { GameType } from "./app-constants";

export interface GameProperties {
  deckSite: string;
  decklistApi: string;
}

export const GamePropertiesMap: { [key in GameType]: GameProperties } = {
  marvelchampions: {
    deckSite: "marvelcdb.com",
    decklistApi: "https://marvelcdb.com/api/public/decklist/",
  },
  lotrlcg: {
    deckSite: "ringsdb.com",
    decklistApi: "https://ringsdb.com/api/public/decklist/",
  },
};
