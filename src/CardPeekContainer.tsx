import { connect } from "react-redux";
import { getNoteValue, isNoteVisible } from "./features/notes/notes.selectors";
import { toggleNotes, updateNoteValue } from "./features/notes/notes.slice";
import Notes from "./Notes";
import { RootState } from "./store/rootReducer";
import CardPeek from "./CardPeek";
import { getGame } from "./features/game/game.selectors";
import { hideCardPeek } from "./features/game/game.slice";

const mapStateToProps = (state: RootState) => {
  return {
    visible: !!getGame(state).showCardPeekCards,
    numToPeek: getGame(state).showCardPeekCards,
  };
};

const CardPeekContainer = connect(mapStateToProps, {
  hideCardPeek,
})(CardPeek);

export default CardPeekContainer;
