import { connect } from "react-redux";
import PlayerBoards from "./PlayerBoards";
import { RootState } from "./store/rootReducer";
import { getPlayerBoards } from "./features/cards/cards.selectors";
import { movePlayerBoard } from "./features/cards/cards.slice";

const mapStateToProps = (state: RootState) => {
  return {
    boards: getPlayerBoards(state),
  };
};

const PlayerBoardsContainer = connect(mapStateToProps, {
  movePlayerBoard,
})(PlayerBoards);

export default PlayerBoardsContainer;
