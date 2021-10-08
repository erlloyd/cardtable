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
import {
  setMenuPreviewCardJsonId,
  clearMenuPreviewCardJsonId,
  startDraggingCardFromHand,
  stopDraggingCardFromHand,
} from "./features/game/game.slice";
interface IProps {
  playerNumber: number;
}

const mapStateToProps = (state: RootState, ownProps: IProps) => {
  return {
    playerHandData: getPlayerCardsForPlayerNumber(ownProps.playerNumber)(state),
    playerCardData: getCardsDataHeroEntities(state),
    currentGameType: getGame(state).activeGameType,
    dragging: getGame(state).draggingCardFromHand,
    ...ownProps,
  };
};

const PlayerHandContainer = connect(mapStateToProps, {
  reorderPlayerHand,
  removeFromPlayerHand,
  setPreviewCardJsonId: setMenuPreviewCardJsonId,
  clearPreviewCardJsonId: clearMenuPreviewCardJsonId,
  startDraggingCardFromHand,
  stopDraggingCardFromHand,
})(PlayerHand);

export default PlayerHandContainer;
