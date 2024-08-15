import { connect } from "react-redux";
import GameContextMenu from "./GameContextMenu";
import { RootState } from "./store/rootReducer";
import {
  getActiveGameType,
  getGame,
  getPeerId,
  getRecentlyLoadedDecksForGameType,
} from "./features/game/game.selectors";
import {
  clearRecentlyLoadedDecks,
  createNewMultiplayerGame,
  quitGame,
  requestResync,
  showCardPeekForCards,
  showDeckSearch,
  showDeckTextImporter,
  showSpecificCardLoader,
} from "./features/game/game.slice";
import {
  addExtraIcon,
  adjustModifier,
  adjustStatusToken,
  clearAllModifiers,
  deleteCardStack,
  flipCards,
  removeExtraIcon,
  toggleToken,
  toggleTopCardOfStackFaceup,
} from "./features/cards/cards.slice";
import {
  addToPlayerHandWithRoleCheck,
  adjustCounterToken,
  createDeckFromJson,
  drawCardsOutOfCardStack,
  fetchRecentDeck,
  shuffleStack,
} from "./features/cards/cards.thunks";
import { GameType } from "./game-modules/GameType";
import { getCardsDataEntities } from "./features/cards-data/cards-data.selectors";
import {
  generateGameStateSave,
  generateGameStateUrl,
  loadAndStoreChangelog,
  loadGameStateFromSave,
  saveDeckAsJson,
} from "./features/game/game.thunks";
import {
  removeCounter,
  updateCounterColor,
  updateCounterValue,
} from "./features/counters/counters.slice";
import {
  parseCsvCustomCards,
  removeCustomCards,
} from "./features/cards-data/cards-data.thunks";
import { addNewPlaymatInColumn } from "./features/playmats/playmats.thunks";
import { resetPlaymats } from "./features/playmats/playmats.slice";
import { redo, undo } from "./features/game/undo-redo.thunks";
import { resetApp } from "./store/global.actions";
import { ActionCreators } from "redux-undo";
import { addNewCounter } from "./features/counters/counters.thunks";
import { removeAllArrows } from "./features/arrows/arrows.slice";

const mapStateToProps = (state: RootState) => {
  const currentGameType = getActiveGameType(state) ?? GameType.MarvelChampions;
  return {
    currentGameType,
    gameState: getGame(state),
    cardsData: getCardsDataEntities(state),
    peerId: getPeerId(state),
    recentlyLoadedDecks:
      getRecentlyLoadedDecksForGameType(currentGameType)(state),
  };
};

const GameContextMenuContainer = connect(mapStateToProps, {
  showCardPeekForCards,
  toggleTopCardOfStackFaceup,
  addToPlayerHandWithRoleCheck,
  drawCardsOutOfCardStack,
  flipCards,
  shuffleStack,
  deleteCardStack,
  saveDeckAsJson,
  adjustStatusToken,
  toggleToken,
  adjustCounterToken,
  adjustModifier,
  addExtraIcon,
  removeExtraIcon,
  clearAllModifiers,
  removeCounter,
  updateCounterValue,
  updateCounterColor,
  createDeckFromJson,
  showDeckSearch,
  showDeckTextImporter,
  showSpecificCardLoader,
  parseCsvCustomCards,
  requestResync,
  removeCustomCards,
  addNewPlaymatInColumn,
  resetPlaymats,
  undo,
  redo,
  generateGameStateSave,
  loadGameStateFromSave,
  resetApp,
  quitGame,
  clearHistory: ActionCreators.clearHistory,
  addNewCounter,
  removeAllArrows,
  createNewMultiplayerGame,
  generateGameStateUrl,
  loadAndStoreChangelog,
  clearRecentlyLoadedDecks,
  fetchRecentDeck,
})(GameContextMenu);

export default GameContextMenuContainer;
