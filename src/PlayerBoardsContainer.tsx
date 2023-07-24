import { connect } from "react-redux";
import PlayerBoards from "./PlayerBoards";
import { RootState } from "./store/rootReducer";
import { getPlayerBoards } from "./features/cards/cards.selectors";

const mapStateToProps = (state: RootState) => {
  return {
    boards: getPlayerBoards(state),
  };
};

const PlayerBoardsContainer = connect(mapStateToProps, {})(PlayerBoards);

export default PlayerBoardsContainer;
