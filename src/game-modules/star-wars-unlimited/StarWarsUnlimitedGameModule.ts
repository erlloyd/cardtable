import axios, { AxiosResponse } from "axios";
import log from "loglevel";
import { CardSizeType } from "../../constants/card-constants";
import { CardData } from "../../external-api/common-card-data";
import { IEncounterEntity } from "../../features/cards-data/cards-data.selectors";
import { ICardData, ISetData } from "../../features/cards-data/initialState";
import { RootState } from "../../store/rootReducer";
import {
  GameModule,
  ILoadCardsData,
  ILoadEncounterSetData,
  ILoadedDeck,
  ILoadedDeckMetadata,
  IPackMetadata,
} from "../GameModule";
import { GameType } from "../GameType";
import { packList as swuPackList } from "./generated/packsList";
import { properties } from "./properties";

type Aspect =
  | "Vigilance"
  | "Villainy"
  | "Heroism"
  | "Command"
  | "Aggression"
  | "Cunning";
type AspectMap = { S: Aspect };
type Trait = string;
type TraitMap = { S: Trait };

interface StarWarsUnlimitedCard {
  Set: string;
  Number: string;
  Name: string;
  Subtitle?: string;
  Type: string;
  Aspects: AspectMap[];
  Traits?: TraitMap[];
  Arenas?: string[];
  Cost?: string;
  Power?: string;
  HP?: string;
  FrontText?: string;
  EpicAction?: string;
  DoubleSided: boolean;
  BackText?: string;
  Rarity: "C" | "U" | "R" | "S" | "L";
  Unique: boolean;
  Keywords?: string[];
  Artist: string;
  FrontArt: string;
  BackArt?: string;
}

interface SWUDeckCard {
  id: string;
  count: number;
}

interface SWUDeckMetadata {
  name: string;
  author: string;
}

interface SWUDBDeck {
  metadata: SWUDeckMetadata;
  leader: SWUDeckCard;
  secondleader: SWUDeckCard | null;
  base: SWUDeckCard;
  deck: SWUDeckCard[];
  sideboard?: SWUDeckCard[] | null;
}

export default class StarWarsUnlimitedGameModule extends GameModule {
  constructor() {
    super(properties, {}, {}, {}, ["leader", "base"]);
  }

  getSetData(): ISetData {
    const setData: ISetData = {};
    return setData;
  }
  async getCardsData(): Promise<ILoadCardsData[]> {
    let resultsList = await Promise.all(
      swuPackList.map((pack) => getSpecificSWUPack(pack))
    );

    let failed = resultsList.filter((r) => r.res.status !== 200);
    if (failed.length > 0) {
      log.error(
        "Failed to load some JSON data:",
        failed.map((r) => r.packCode)
      );
    }

    return resultsList
      .filter((r) => r.res.status === 200)
      .map((r) => {
        return {
          packType: GameType.StarWarsUnlimited,
          pack: r.res.data as any,
          pack_code: r.packCode,
        };
      });
  }
  async getEncounterSetData(): Promise<ILoadEncounterSetData[]> {
    return [];
  }
  checkIsPlayerPack(_packCode: string): boolean {
    return true;
  }
  convertCardDataToCommonFormat(packWithMetadata: {
    pack: any;
    metadata: IPackMetadata;
  }): CardData[] {
    const pack = packWithMetadata.pack as StarWarsUnlimitedCard[];
    return pack.map((c) => ({
      code: `${c.Set}_${c.Number}`,
      name: `${c.Name}${c.Subtitle ? " - " + c.Subtitle : ""}`,
      images: {
        front: c.FrontArt,
        back:
          c.BackArt ??
          "https://felttable.com/static/media/card_back_s.315ba0f9.jpg",
      },
      octgnId: null,
      quantity: 1,
      doubleSided: c.DoubleSided,
      backLink: null,
      typeCode: c.Type,
      subTypeCode: null,
      extraInfo: {
        campaign: false,
        setCode: `${c.Set}`,
        packCode: "TODO - swu",
        setType: null,
        factionCode: null,
        sizeType: CardSizeType.Standard,
      },
    }));
  }

  parseDecklist(
    _response: AxiosResponse<any, any>,
    _state: RootState
  ): [string[], ILoadedDeck, ILoadedDeckMetadata] {
    throw new Error("Method not implemented.");
  }

  loadDeckFromText(text: string): [string[][], ILoadedDeckMetadata] {
    try {
      // the string should be JSON
      const deckInfo: SWUDBDeck = JSON.parse(text);
      const base = [deckInfo.base.id];
      const leader = [deckInfo.leader.id];

      if (!!deckInfo.secondleader) {
        leader.push(deckInfo.secondleader.id);
      }

      const deck: string[] = [];
      deckInfo.deck.forEach((c) => {
        for (let i = 0; i < c.count; i++) {
          deck.push(c.id);
        }
      });

      const sideboard: string[] = [];
      deckInfo.sideboard?.forEach((c) => {
        for (let i = 0; i < c.count; i++) {
          sideboard.push(c.id);
        }
      });

      return [
        [leader, base, deck, sideboard],
        { displayName: `${deckInfo.metadata.name}` },
      ];
    } catch (e) {
      throw new Error("Unable to load deck");
    }
  }

  isCardBackImg(imgUrl: string): boolean {
    return imgUrl.indexOf("card_back") !== -1;
  }

  getEncounterEntitiesFromState(
    _setData: ISetData,
    _herosData: ICardData,
    encounterEntities: ICardData
  ): IEncounterEntity[] {
    return [];
  }

  splitEncounterCardsIntoStacksWhenLoading(
    _setCode: string,
    _encounterCards: CardData[]
  ): CardData[][] {
    return [];
  }

  shouldRotateCard(code: string, type: string, faceup: boolean): boolean {
    // default to not rotating;
    let rotate = false;
    // if we're a leader and face-up rotate
    if (type.toLocaleLowerCase() === "leader" && faceup) {
      rotate = true;
    } else if (type.toLocaleLowerCase() === "base") {
      rotate = true;
    }
    return rotate;
  }
}

const getSpecificSWUPack = async (
  packName: string
): Promise<{
  res: AxiosResponse<StarWarsUnlimitedCard[]>;
  packCode: string;
}> => {
  const response = await axios.get<StarWarsUnlimitedCard[]>(
    "/json_data/" + packName
  );
  return {
    res: response,
    packCode: packName.split(".json")[0],
  };
};
