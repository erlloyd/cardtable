// These are the actions that we explicitly don't want
// to send to any peers. These are actions that represent
// updates we would only want to display visually on the
// screen of the player initiating the action. Zooming is
// a great example. One player adjusting their zoom shouldn't

import {
  loadCardsData,
  loadCardsDataForPack,
  loadCardsForEncounterSet,
} from "../features/cards-data/cards-data.slice";
import {
  togglePanMode,
  cardFromHandMoveWithSnap,
  toggleMultiselectMode,
} from "../features/cards/cards.slice";
import {
  clearMenuPreviewCardJsonId,
  clearPreviewCard,
  connectToRemoteGame,
  requestResync,
  setMenuPreviewCardJsonId,
  setMultiplayerGameName,
  setPreviewCardId,
  setVisiblePlayerHandNumber,
  stopDraggingCardFromHand,
  toggleDrawCardsIntoHand,
  toggleSnapCardsToGrid,
  updatePosition,
  updateZoom,
} from "../features/game/game.slice";
import {
  receiveRemoteGameState,
  startDraggingCardFromHand,
} from "./global.actions";

// affect any other player's zoom.
export const blacklistRemoteActions = {
  [connectToRemoteGame.type]: true,
  [updatePosition.type]: true,
  [updateZoom.type]: true,
  [setPreviewCardId.type]: true,
  [clearPreviewCard.type]: true,
  [setMenuPreviewCardJsonId.type]: true,
  [clearMenuPreviewCardJsonId.type]: true,
  [togglePanMode.type]: true,
  [receiveRemoteGameState.type]: true,
  [requestResync.type]: true,
  [loadCardsData.type]: true,
  [loadCardsDataForPack.type]: true,
  [loadCardsForEncounterSet.type]: true,
  [startDraggingCardFromHand.type]: true,
  [stopDraggingCardFromHand.type]: true,
  [cardFromHandMoveWithSnap.type]: true,
  [toggleDrawCardsIntoHand.type]: true,
  [toggleSnapCardsToGrid.type]: true,
  [setVisiblePlayerHandNumber.type]: true,
  [toggleMultiselectMode.type]: true,
  [setMultiplayerGameName.type]: true,
};

export const misingPlayerNumInSeq = (
  source: number[],
  min = 0,
  max = source.length
): number => {
  const sorted = [...source].sort();
  let missingNumber = -1;
  sorted.every((element, i) => {
    if (element !== i + 1) {
      missingNumber = i + 1;
      return false;
    }
    return true;
  });

  if (missingNumber === -1) {
    missingNumber = sorted.length + 1;
  }

  return missingNumber;
};
