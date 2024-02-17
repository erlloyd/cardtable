import { GameModule, StringToStringMap } from "./GameModule";
import { GameType } from "./GameType";
import { GameProperties } from "./GameModule";
import { showHiddenGamesLocalStorage } from "../constants/app-constants";

import MarvelChampionsGameModule from "./marvel-champions/MavelChampionsGameModule";
import LOTRLCGGameModule from "./lotr-lcg/LOTRLCGGameModule";
import WarOfTheRingTheCardGameModule from "./war-of-the-ring-card-game/WarOfTheRingTheCardGameModule";
import StarWarsDeckbuildingGameModule from "./star-wars-deckbuilding-game/StarWarsDeckbuildingGameModule";
import StandardDeckGameModule from "./standard-deck/StandardDeckGameModule";
import LorcanaGameModule from "./lorcana/LorcanaGameModule";
import StarWarsUnlimitedGameModule from "./star-wars-unlimited/StarWarsUnlimitedGameModule";
import MarvelLegendaryGameModule from "./marvel-legendary/MarvelLegendaryGameModule";
import EarthborneRangersGameModule from "./earthborne-rangers/EarthborneRangersGameModule";

const games: { type: GameType; module: GameModule; hidden?: boolean }[] = [
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
  {
    type: GameType.StarWarsDeckbuildingGame,
    module: new StarWarsDeckbuildingGameModule(),
  },
  {
    type: GameType.StandardDeck,
    module: new StandardDeckGameModule(),
  },
  {
    type: GameType.Lorcana,
    module: new LorcanaGameModule(),
  },
  {
    type: GameType.StarWarsUnlimited,
    module: new StarWarsUnlimitedGameModule(),
  },
  {
    type: GameType.MarvelLegendary,
    module: new MarvelLegendaryGameModule(),
    hidden: true,
  },
  {
    type: GameType.EarthborneRangers,
    module: new EarthborneRangersGameModule(),
    hidden: true,
  },
];

class GamePluginManager {
  private _games:
    | null
    | { type: GameType; module: GameModule; hidden?: boolean }[] = null;
  private _properties: null | { [key in GameType]: GameProperties } = null;
  private _cardImageMap: null | { [key in GameType]: StringToStringMap } = null;
  private _horizontalCardTypes: null | { [key in GameType]: string[] } = null;

  public get allRegisteredModules(): GameModule[] {
    return this._games?.map((g) => g.module) ?? [];
  }

  public get allRegisteredGameTypes(): GameType[] {
    return this._games?.map((g) => g.type) ?? [];
  }

  public get allNonHiddenGameTypes(): GameType[] {
    return (
      this._games
        ?.filter((g) => showHiddenGamesLocalStorage || !g.hidden)
        .map((g) => g.type) ?? []
    );
  }

  public get properties(): { [key in GameType]: GameProperties } {
    return this._properties!;
  }

  public get cardImageMap(): { [key in GameType]: StringToStringMap } {
    return this._cardImageMap!;
  }

  public get horizontalCardTypes(): { [key in GameType]: string[] } {
    return this._horizontalCardTypes!;
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

    this._cardImageMap = games.reduce((imageMap, g) => {
      imageMap[g.type] = g.module.imageMap;
      return imageMap;
    }, {} as { [key in GameType]: StringToStringMap });

    this._horizontalCardTypes = games.reduce((horizontalCards, g) => {
      horizontalCards[g.type] = ["custom_landscape"].concat(
        g.module.horizontalTypeCodes
      );
      return horizontalCards;
    }, {} as { [key in GameType]: string[] });
  }
}

const GameManager = new GamePluginManager();
GameManager.registerModules(games);

export default GameManager;
