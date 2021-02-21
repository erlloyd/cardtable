import { GameType } from "./app-constants";

export interface GameProperties {
  deckSite: string;
}

export const GamePropertiesMap: { [key in GameType]: GameProperties } = {
  marvelchampions: {
    deckSite: "marvelcdb.com",
  },
  lotrlcg: {
    deckSite: "ringsdb.com",
  },
};
