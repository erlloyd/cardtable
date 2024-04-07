import { AxiosResponse } from "axios";
import { groupBy } from "lodash";
import { CardData } from "../../external-api/common-card-data";
import { IEncounterEntity } from "../../features/cards-data/cards-data.selectors";
import { ICardData, ISetData } from "../../features/cards-data/initialState";
import { RootState } from "../../store/rootReducer";
import {
  GameModule,
  ILoadCardsData,
  ILoadEncounterSetData,
  ILoadedDeck,
  IPackMetadata,
} from "../GameModule";
import { properties } from "./properties";

export default class GenericCustomGameModule extends GameModule {
  constructor() {
    super(properties, {}, {}, {}, []);
  }
  getSetData(): ISetData {
    const setData: ISetData = {};
    return setData;
  }
  async getCardsData(): Promise<ILoadCardsData[]> {
    return [];
  }
  async getEncounterSetData(): Promise<ILoadEncounterSetData[]> {
    return [];
  }
  checkIsPlayerPack(_packCode: string): boolean {
    return false;
  }
  convertCardDataToCommonFormat(packWithMetadata: {
    pack: any;
    metadata: IPackMetadata;
  }): CardData[] {
    return [];
  }
  parseDecklist(
    _response: AxiosResponse<any, any>,
    _state: RootState
  ): [string[], ILoadedDeck] {
    throw new Error("Method not implemented.");
  }
  getEncounterEntitiesFromState(
    setData: ISetData,
    _herosData: ICardData,
    encounterEntities: ICardData
  ): IEncounterEntity[] {
    return Object.entries(setData).map(([key, value]) => {
      const cardsWithoutQuantity = value.cardsInSet.map(
        (cis) => encounterEntities[cis.code]
      );
      let cards = [] as CardData[];
      cardsWithoutQuantity.forEach((c) => {
        cards = cards.concat(Array.from({ length: c.quantity }).map((_i) => c));
      });
      return {
        setCode: key,
        setData: value,
        cards,
      };
    });
  }

  splitEncounterCardsIntoStacksWhenLoading(
    setCode: string,
    encounterCards: CardData[]
  ): CardData[][] {
    const temp = groupBy<CardData>(encounterCards, (e) => e.extraInfo.setCode);
    return Object.values(temp);
  }
}
