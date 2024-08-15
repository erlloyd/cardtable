import { connect } from "react-redux";
import DeckTextImporter from "./DeckTextImporter";
import { getActiveGameType, getGame } from "./features/game/game.selectors";
import { RootState } from "./store/rootReducer";
import { hideDeckTextImporter } from "./features/game/game.slice";
import { fetchDecklistByText } from "./features/cards/cards.thunks";
import { sendNotification } from "./features/notifications/notifications.slice";

const mapStateToProps = (state: RootState) => {
  return {
    gameType: getActiveGameType(state),
    positionToImport: getGame(state).showDeckTextImporterWithPosition,
  };
};

const DeckTextImporterContainer = connect(mapStateToProps, {
  hideDeckTextImporter,
  sendNotification,
  fetchDecklistByText,
})(DeckTextImporter);

export default DeckTextImporterContainer;
