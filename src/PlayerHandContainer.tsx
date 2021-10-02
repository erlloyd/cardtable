import { connect } from "react-redux";
import {
  reorderPlayerHand,
  removeFromPlayerHand,
} from "./features/cards/cards.slice";
import { getPlayerCardsForPlayerNumber } from "./features/cards/cards.selectors";
import PlayerHand from "./PlayerHand";
import { RootState } from "./store/rootReducer";

interface IProps {
  playerNumber: number;
}

const mapStateToProps = (state: RootState, ownProps: IProps) => {
  return {
    playerHandData: getPlayerCardsForPlayerNumber(ownProps.playerNumber)(state),
    ...ownProps,
  };
};

const PlayerHandContainer = connect(mapStateToProps, {
  reorderPlayerHand,
  removeFromPlayerHand,
})(PlayerHand);

export default PlayerHandContainer;
