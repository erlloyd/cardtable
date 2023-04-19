import { CodeToImageMap, GameModule } from "./GameModule";
import { GameType } from "../constants/app-constants";
import { GameProperties } from "./GameModule";

import MarvelChampionsGameModule from "./marvel-champions/MavelChampionsGameModule";
import LOTRLCGGameModule from "./lotr-lcg/LOTRLCGGameModule";

const games: { type: GameType; module: GameModule }[] = [
  {
    type: GameType.MarvelChampions,
    module: new MarvelChampionsGameModule(),
  },
  {
    type: GameType.LordOfTheRingsLivingCardGame,
    module: new LOTRLCGGameModule(),
  },
];

class GamePluginManager {
  private _games: null | { type: GameType; module: GameModule }[] = null;
  private _properties: null | { [key in GameType]: GameProperties } = null;
  private _cardImageMap: null | { [key in GameType]: CodeToImageMap } = null;

  public get properties(): { [key in GameType]: GameProperties } {
    return this._properties!;
  }

  public get cardImageMap(): { [key in GameType]: CodeToImageMap } {
    return this._cardImageMap!;
  }

  registerModules(games: { type: GameType; module: GameModule }[]) {
    this._games = games;

    this._properties = games.reduce((properties, g) => {
      properties[g.type] = g.module.properties;
      return properties;
    }, {} as { [key in GameType]: GameProperties });

    this._cardImageMap = games.reduce((imageMap, g) => {
      imageMap[g.type] = g.module.imageMap;
      return imageMap;
    }, {} as { [key in GameType]: CodeToImageMap });
  }
}

const GameManager = new GamePluginManager();
GameManager.registerModules(games);

export default GameManager;
