import { connect } from "react-redux";
import {
  reorderPlayerHand,
  removeFromPlayerHand,
  setPlayerRole,
  clearPlayerRole,
} from "./features/cards/cards.slice";
import { getPlayerCardsForPlayerNumber } from "./features/cards/cards.selectors";
import PlayerHand from "./PlayerHand";
import { RootState } from "./store/rootReducer";
import { getCardsDataEntities } from "./features/cards-data/cards-data.selectors";
import { getGame } from "./features/game/game.selectors";
import {
  setMenuPreviewCardJsonId,
  clearMenuPreviewCardJsonId,
  stopDraggingCardFromHand,
  setVisiblePlayerHandNumber,
} from "./features/game/game.slice";
import { startDraggingCardFromHand } from "./store/global.actions";
interface IProps {
  playerNumber: number;
}

const mapStateToProps = (state: RootState, ownProps: IProps) => {
  const playerNumberToShow =
    getGame(state).currentVisiblePlayerHandNumber ?? ownProps.playerNumber;
  return {
    playerHandData: getPlayerCardsForPlayerNumber(playerNumberToShow)(state),
    cardData: getCardsDataEntities(state),
    currentGameType: getGame(state).activeGameType,
    dragging: getGame(state).draggingCardFromHand,
    playerNumber: playerNumberToShow,
  };
};

const PlayerHandContainer = connect(mapStateToProps, {
  reorderPlayerHand,
  removeFromPlayerHand,
  setPreviewCardJsonId: setMenuPreviewCardJsonId,
  clearPreviewCardJsonId: clearMenuPreviewCardJsonId,
  startDraggingCardFromHand,
  stopDraggingCardFromHand,
  setVisiblePlayerHandNumber,
  setPlayerRole,
  clearPlayerRole,
})(PlayerHand);

export default PlayerHandContainer;
