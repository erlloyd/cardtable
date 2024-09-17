import { connect } from "react-redux";
import { ActionCreators } from "redux-undo";
import { removeAllArrows } from "./features/arrows/arrows.slice";
import { getCardsDataEntities } from "./features/cards-data/cards-data.selectors";
import {
  parseCsvCustomCards,
  removeCustomCards,
} from "./features/cards-data/cards-data.thunks";
import {
  addExtraIcon,
  adjustModifier,
  adjustStatusToken,
  clearAllModifiers,
  clearCardTokens,
  deleteCardStack,
  flipCards,
  removeExtraIcon,
  toggleToken,
  toggleTopCardOfStackFaceup,
} from "./features/cards/cards.slice";
import {
  addToPlayerHandWithRoleCheck,
  createDeckFromJson,
  drawCardsOutOfCardStack,
  fetchRecentDeck,
  shuffleStack,
} from "./features/cards/cards.thunks";
import {
  removeCounter,
  updateCounterColor,
  updateCounterValue,
} from "./features/counters/counters.slice";
import { addNewCounter } from "./features/counters/counters.thunks";
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
  generateGameStateSave,
  generateGameStateUrl,
  loadAndStoreChangelog,
  loadGameStateFromSave,
  saveDeckAsJson,
} from "./features/game/game.thunks";
import { redo, undo } from "./features/game/undo-redo.thunks";
import { resetPlaymats } from "./features/playmats/playmats.slice";
import { addNewPlaymatInColumn } from "./features/playmats/playmats.thunks";
import { spawnTokenBags } from "./features/token-bags/token-bags.thunks";
import { GameType } from "./game-modules/GameType";
import GameContextMenu from "./GameContextMenu";
import { resetApp } from "./store/global.actions";
import { RootState } from "./store/rootReducer";

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
  clearCardTokens,
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
  spawnTokenBags,
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
