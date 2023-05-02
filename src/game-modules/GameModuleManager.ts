import { CodeToImageMap, GameModule } from "./GameModule";
import { GameType } from "./GameModule";
import { GameProperties } from "./GameModule";

import MarvelChampionsGameModule from "./marvel-champions/MavelChampionsGameModule";
import LOTRLCGGameModule from "./lotr-lcg/LOTRLCGGameModule";
import WarOfTheRingTheCardGameModule from "./war-of-the-ring-card-game/WarOfTheRingTheCardGameModule";

const games: { type: GameType; module: GameModule }[] = [
  {
    type: GameType.MarvelChampions,
    module: new MarvelChampionsGameModule(),
  },
  {
    type: GameType.LordOfTheRingsLivingCardGame,
    module: new LOTRLCGGameModule(),
  },
  {
    type: GameType.WarOfTheRingTheCardGame,
    module: new WarOfTheRingTheCardGameModule(),
  },
];

class GamePluginManager {
  private _games: null | { type: GameType; module: GameModule }[] = null;
  private _properties: null | { [key in GameType]: GameProperties } = null;
  private _cardImageMap: null | { [key in GameType]: CodeToImageMap } = null;

  public get allRegisteredGameTypes(): GameType[] {
    return this._games?.map((g) => g.type) ?? [];
  }

  public get properties(): { [key in GameType]: GameProperties } {
    return this._properties!;
  }

  public get cardImageMap(): { [key in GameType]: CodeToImageMap } {
    return this._cardImageMap!;
  }

  getModuleForType(type: GameType): GameModule {
    const module = this._games?.find((g) => g.type === type)?.module ?? null;

    if (!module) {
      throw new Error(
        `Tried to get module for game type ${type} that isn't registered`
      );
    }

    return module;
  }

  registerModules(games: { type: GameType; module: GameModule }[]) {
    this._games = games;

    this._properties = games.reduce((properties, g) => {
      properties[g.type] = g.module.properties;
      return properties;
    }, {} as { [key in GameType]: GameProperties });

    console.log(`this._properties`, this._properties);

    this._cardImageMap = games.reduce((imageMap, g) => {
      imageMap[g.type] = g.module.imageMap;
      return imageMap;
    }, {} as { [key in GameType]: CodeToImageMap });
  }
}

const GameManager = new GamePluginManager();
GameManager.registerModules(games);

export default GameManager;
