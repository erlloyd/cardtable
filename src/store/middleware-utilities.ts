// These are the actions that we explicitly don't want
// to send to any peers. These are actions that represent
// updates we would only want to display visually on the
// screen of the player initiating the action. Zooming is
// a great example. One player adjusting their zoom shouldn't

import { ActionTypes } from "redux-undo";
import {
  bulkLoadCardsDataForPack,
  bulkLoadCardsForEncounterSet,
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
  createNewMultiplayerGame,
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
  doneLoadingJSON,
  removePlayer,
  showSpecificCardLoader,
  togglePreviewCardRotation,
  showDeckTextImporter,
  hideDeckTextImporter,
  showDeckSearch,
  hideDeckSearch,
  showCardPeekForCards,
  hideCardPeek,
  quitGame,
  toggleShowFullHandUI,
  hideSettingsUi,
  showSettingsUi,
  updateSettings,
} from "../features/game/game.slice";
import { toggleNotes } from "../features/notes/notes.slice";
import {
  clearNotification,
  sendAndForceNotification,
  sendNotification,
} from "../features/notifications/notifications.slice";
import {
  receiveRemoteGameState,
  startDraggingCardFromHand,
} from "./global.actions";

// affect any other player's zoom.
export const blacklistRemoteActions = {
  [connectToRemoteGame.type]: true,
  [createNewMultiplayerGame.type]: true,
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
  [toggleNotes.type]: true,
  [doneLoadingJSON.type]: true,
  [bulkLoadCardsDataForPack.type]: true,
  [bulkLoadCardsForEncounterSet.type]: true,
  [sendNotification.type]: true,
  [sendAndForceNotification.type]: true,
  [clearNotification.type]: true,
  [removePlayer.type]: true,
  [showSpecificCardLoader.type]: true,
  [togglePreviewCardRotation.type]: true,
  [showDeckTextImporter.type]: true,
  [hideDeckTextImporter.type]: true,
  [showDeckSearch.type]: true,
  [hideDeckSearch.type]: true,
  [showCardPeekForCards.type]: true,
  [hideCardPeek.type]: true,
  [quitGame.type]: true,
  [toggleShowFullHandUI.type]: true,
  [updateSettings.type]: true,
  [showSettingsUi.type]: true,
  [hideSettingsUi.type]: true,
  // We want to handle undo / redo differently when via multiplayer
  [ActionTypes.UNDO]: true,
  [ActionTypes.REDO]: true,
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
