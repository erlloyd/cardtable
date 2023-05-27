import { connect } from "react-redux";
import PlayerHand from "./PlayerHand";
import { myPeerRef } from "./constants/app-constants";
import { getCardsDataEntities } from "./features/cards-data/cards-data.selectors";
import { getPlayerCardsForPlayerNumber } from "./features/cards/cards.selectors";
import {
  clearPlayerRole,
  removeFromPlayerHand,
  reorderPlayerHand,
  setPlayerRole,
} from "./features/cards/cards.slice";
import { getGame, getPlayerColors } from "./features/game/game.selectors";
import {
  clearMenuPreviewCardJsonId,
  setMenuPreviewCardJsonId,
  setVisiblePlayerHandNumber,
  stopDraggingCardFromHand,
} from "./features/game/game.slice";
import { startDraggingCardFromHand } from "./store/global.actions";
import { RootState } from "./store/rootReducer";
interface IProps {
  playerNumber: number;
}

const mapStateToProps = (state: RootState, ownProps: IProps) => {
  const playerNumberToShow =
    getGame(state).currentVisiblePlayerHandNumber ?? ownProps.playerNumber;

  const myPlayerColor = getPlayerColors(state)[myPeerRef];

  return {
    playerHandData: getPlayerCardsForPlayerNumber(playerNumberToShow)(state),
    cardData: getCardsDataEntities(state),
    currentGameType: getGame(state).activeGameType,
    dragging: getGame(state).draggingCardFromHand,
    playerNumber: playerNumberToShow,
    playerColor: myPlayerColor,
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
