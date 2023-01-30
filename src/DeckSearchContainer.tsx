import { connect } from "react-redux";
import DeckSearch from "./DeckSearch";
import { getDeckSearchPosition } from "./features/game/game.selectors";
import { hideDeckSearch } from "./features/game/game.slice";
import { RootState } from "./store/rootReducer";

const mapStateToProps = (state: RootState) => {
  return {
    position: getDeckSearchPosition(state),
  };
};

const DeckSearchContainer = connect(mapStateToProps, {
  hideDeckSearch,
})(DeckSearch);

export default DeckSearchContainer;
