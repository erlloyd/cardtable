import { connect } from "react-redux";
import PlayerHand from "./PlayerHand";
import { myPeerRef } from "./constants/app-constants";
import { getCardsDataEntities } from "./features/cards-data/cards-data.selectors";
import {
  getAllPlayerHandData,
  getPlayerCardsForPlayerNumber,
} from "./features/cards/cards.selectors";
import {
  clearPlayerRole,
  removeFromPlayerHand,
  flipInPlayerHand,
  reorderPlayerHand,
  setPlayerRole,
} from "./features/cards/cards.slice";
import {
  getGame,
  getPlayerColors,
  getShowFullHandUI,
} from "./features/game/game.selectors";
import {
  clearMenuPreviewCardJsonId,
  setMenuPreviewCardJsonId,
  setVisiblePlayerHandNumber,
  stopDraggingCardFromHand,
  toggleShowFullHandUI,
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
    allPlayerHandsData: getAllPlayerHandData(state),
    playerHandData: getPlayerCardsForPlayerNumber(playerNumberToShow)(state),
    cardData: getCardsDataEntities(state),
    currentGameType: getGame(state).activeGameType,
    dragging: getGame(state).draggingCardFromHand,
    playerNumber: playerNumberToShow,
    playerColor: myPlayerColor,
    showFullHandUI: getShowFullHandUI(state),
    settings: getGame(state).settings,
  };
};

const PlayerHandContainer = connect(mapStateToProps, {
  reorderPlayerHand,
  removeFromPlayerHand,
  flipInPlayerHand,
  setPreviewCardJsonId: setMenuPreviewCardJsonId,
  clearPreviewCardJsonId: clearMenuPreviewCardJsonId,
  startDraggingCardFromHand,
  stopDraggingCardFromHand,
  setVisiblePlayerHandNumber,
  setPlayerRole,
  clearPlayerRole,
  toggleShowFullHandUI,
})(PlayerHand);

export default PlayerHandContainer;
