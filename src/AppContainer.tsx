import { connect } from "react-redux";
import App from "./App";
import {
  getActiveGameType,
  getCustomGames,
} from "./features/game/game.selectors";
import { clearQueryParams } from "./features/game/game.thunks";
import { RootState } from "./store/rootReducer";
import {
  removeCustomGame,
  updateActiveGameType,
} from "./features/game/game.slice";
import {
  parseCsvCustomCards,
  removeCustomCards,
} from "./features/cards-data/cards-data.thunks";
import { sendNotification } from "./features/notifications/notifications.slice";

const mapStateToProps = (state: RootState) => {
  return {
    activeGameType: getActiveGameType(state),
    customGames: getCustomGames(state),
  };
};

const AppContainer = connect(mapStateToProps, {
  updateActiveGameType,
  clearQueryParams,
  parseCsvCustomCards,
  removeCustomCards,
  removeCustomGame,
  sendNotification,
})(App);

export default AppContainer;
