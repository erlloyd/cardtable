import { AxiosResponse } from "axios";
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

export default class WarOfTheRingTheCardGameModule extends GameModule {
  constructor() {
    super(properties, {}, {}, {});
  }
  getSetData(): ISetData {
    return {};
  }
  async getCardsData(): Promise<ILoadCardsData[]> {
    return [];
  }
  async getEncounterSetData(): Promise<ILoadEncounterSetData[]> {
    return [];
  }
  checkIsPlayerPack(packCode: string): boolean {
    return false;
  }
  convertCardDataToCommonFormat(packWithMetadata: {
    pack: any;
    metadata: IPackMetadata;
  }): CardData[] {
    return [];
  }
  parseDecklist(
    response: AxiosResponse<any, any>,
    state: RootState
  ): [string[], ILoadedDeck] {
    throw new Error("Method not implemented.");
  }
  getEncounterEntitiesFromState(
    setData: ISetData,
    herosData: ICardData,
    encounterEntities: ICardData
  ): IEncounterEntity[] {
    throw new Error("Method not implemented.");
  }
}
