import { connect } from "react-redux";
import {
  reorderPlayerHand,
  removeFromPlayerHand,
} from "./features/cards/cards.slice";
import { getPlayerCardsForPlayerNumber } from "./features/cards/cards.selectors";
import PlayerHand from "./PlayerHand";
import { RootState } from "./store/rootReducer";
import { getCardsDataHeroEntities } from "./features/cards-data/cards-data.selectors";
import { getGame } from "./features/game/game.selectors";

interface IProps {
  playerNumber: number;
}

const mapStateToProps = (state: RootState, ownProps: IProps) => {
  return {
    playerHandData: getPlayerCardsForPlayerNumber(ownProps.playerNumber)(state),
    playerCardData: getCardsDataHeroEntities(state),
    currentGameType: getGame(state).activeGameType,
    ...ownProps,
  };
};

const PlayerHandContainer = connect(mapStateToProps, {
  reorderPlayerHand,
  removeFromPlayerHand,
})(PlayerHand);

export default PlayerHandContainer;
