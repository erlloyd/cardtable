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
  },
  {
    type: GameType.EarthborneRangers,
    module: new EarthborneRangersGameModule(),
  },
];

class GamePluginManager {
  private _games:
    | null
    | { type: GameType | string; module: GameModule; hidden?: boolean }[] =
    null;
  private _properties: null | { [key in GameType | string]: GameProperties } =
    null;
  private _cardImageMap:
    | null
    | { [key in GameType | string]: StringToStringMap } = null;
  private _horizontalCardTypes:
    | null
    | { [key in GameType | string]: string[] } = null;

  public get allRegisteredModules(): GameModule[] {
    return this._games?.map((g) => g.module) ?? [];
  }

  public get allRegisteredGameTypes(): (GameType | string)[] {
    return this._games?.map((g) => g.type) ?? [];
  }

  public get allNonHiddenGameTypes(): (GameType | string)[] {
    return (
      this._games
        ?.filter((g) => showHiddenGamesLocalStorage || !g.hidden)
        .map((g) => g.type) ?? []
    );
  }

  public get properties(): { [key in GameType | string]: GameProperties } {
    return this._properties!;
  }

  public get cardImageMap(): { [key in GameType | string]: StringToStringMap } {
    return this._cardImageMap!;
  }

  public get horizontalCardTypes(): { [key in GameType | string]: string[] } {
    return this._horizontalCardTypes!;
  }

  getModuleForType(type: GameType): GameModule {
    let module = this._games?.find((g) => g.type === type)?.module ?? null;

    if (!module) {
      // For now, because of custom content, this could be true.
      // TODO: make a new "custom content" module. For now, return Standard
      module =
        this._games?.find((g) => g.type === GameType.StandardDeck)?.module ??
        null;
      // throw new Error(
      //   `Tried to get module for game type ${type} that isn't registered`
      // );
    }

    if (!module) {
      throw new Error(`Unable to load module for game type ${type}`);
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

  registerCustomModule(type: string) {
    if (
      !this._games ||
      !this._properties ||
      !this._cardImageMap ||
      !this._horizontalCardTypes
    ) {
      throw new Error("Cannot register custom module first");
    }
    const mod = new StandardDeckGameModule();
    this._games = this._games.concat({
      type,
      module: mod,
    });

    this._properties[type] = mod.properties;
    this._cardImageMap[type] = mod.imageMap;
    this._horizontalCardTypes[type] = ["custom_landscape"].concat(
      mod.horizontalTypeCodes
    );
  }
}

const GameManager = new GamePluginManager();
GameManager.registerModules(games);

export default GameManager;
