import { connect } from "react-redux";
import DeckSearch from "./DeckSearch";
import { getListOfDecklistsFromSearchTerm } from "./features/cards/cards.thunks";
import {
  getActiveGameType,
  getDeckSearchPosition,
  getIsSearchingForOnlineDecks,
  getMostRecentOnlineDeckSearchResults,
} from "./features/game/game.selectors";
import { hideDeckSearch } from "./features/game/game.slice";
import { RootState } from "./store/rootReducer";

const mapStateToProps = (state: RootState) => {
  return {
    gameType: getActiveGameType(state),
    position: getDeckSearchPosition(state),
    searching: getIsSearchingForOnlineDecks(state),
    mostRecentResults: getMostRecentOnlineDeckSearchResults(state),
  };
};

const DeckSearchContainer = connect(mapStateToProps, {
  hideDeckSearch,
  getListOfDecklistsFromSearchTerm,
})(DeckSearch);

export default DeckSearchContainer;
