import { connect } from "react-redux";
import { getNoteValue, isNoteVisible } from "./features/notes/notes.selectors";
import { toggleNotes, updateNoteValue } from "./features/notes/notes.slice";
import Notes from "./Notes";
import { RootState } from "./store/rootReducer";
import CardPeek from "./CardPeek";
import { getActiveGameType, getGame } from "./features/game/game.selectors";
import { hideCardPeek } from "./features/game/game.slice";
import {
  cardsSelectedWithPeerRef,
  getCards,
} from "./features/cards/cards.selectors";
import { myPeerRef } from "./constants/app-constants";
import { getCardsDataEntities } from "./features/cards-data/cards-data.selectors";
import { GameType } from "./game-modules/GameType";
import { reorderAndDrawCardsFromTop } from "./features/cards/cards.thunks";

const mapStateToProps = (state: RootState) => {
  return {
    currentGameType: getActiveGameType(state) ?? GameType.MarvelChampions,
    visible: !!getGame(state).showCardPeekCards,
    numToPeek: getGame(state).showCardPeekCards,
    cardStack: cardsSelectedWithPeerRef(myPeerRef)(state)[0] ?? null,
    cardsDataEntities: getCardsDataEntities(state),
  };
};

const CardPeekContainer = connect(mapStateToProps, {
  hideCardPeek,
  reorderAndDrawCardsFromTop,
})(CardPeek);

export default CardPeekContainer;
