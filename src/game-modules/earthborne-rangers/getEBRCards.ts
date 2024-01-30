import { Vector2d } from "konva/lib/types";
import { RootState } from "../../store/rootReducer";
import { GameType } from "../GameType";
import { getCardsDataHeroEntities } from "../../features/cards-data/cards-data.selectors";
import { ICardDetails } from "../../features/cards/initialState";
import { fixCardCode } from "../common-utils";
import { v4 as uuidv4 } from "uuid";

export interface EBRDeckData {
  deck: {
    awa: number;
    fit: number;
    foc: number;
    id: number;
    meta: {
      role: string;
    };
    slots: { [key: string]: number };
    spi: number;
  };
}

export const getEBRCards = (
  response: { data: { data: EBRDeckData } },
  _state: RootState,
  payload: { gameType: GameType; decklistId: number; position: Vector2d }
) => {
  const deck = response.data.data.deck;

  const heroStack: ICardDetails[] = [
    { jsonId: `aspect-${deck.awa}${deck.spi}${deck.fit}${deck.foc}` },
  ];

  const roleStack: ICardDetails[] = [{ jsonId: deck.meta.role }];

  return {
    position: payload.position,
    heroId: uuidv4(),
    data: response.data.data.deck,
    dataId: uuidv4(),
    extraHeroCards: heroStack,
    relatedEncounterDeck: roleStack.map((r) => r.jsonId),
    encounterDeckId: uuidv4(),
    relatedObligationDeck: [],
    obligationDeckId: uuidv4(),
  };
};
