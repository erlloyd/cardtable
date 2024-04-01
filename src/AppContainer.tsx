import { connect } from "react-redux";
import App from "./App";
import { getActiveGameType } from "./features/game/game.selectors";
import { clearQueryParams } from "./features/game/game.thunks";
import { RootState } from "./store/rootReducer";
import { updateActiveGameType } from "./features/game/game.slice";
import { parseCsvCustomCards } from "./features/cards-data/cards-data.thunks";
import { sendNotification } from "./features/notifications/notifications.slice";

const mapStateToProps = (state: RootState) => {
  return {
    activeGameType: getActiveGameType(state),
  };
};

const AppContainer = connect(mapStateToProps, {
  updateActiveGameType,
  clearQueryParams,
  parseCsvCustomCards,
  sendNotification,
})(App);

export default AppContainer;
