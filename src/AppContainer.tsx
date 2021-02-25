import { connect } from "react-redux";
import App from "./App";
import { getActiveGameType } from "./features/game/game.selectors";
import { updateActiveGameType } from "./features/game/game.slice";
import { RootState } from "./store/rootReducer";

const mapStateToProps = (state: RootState) => {
  return {
    activeGameType: getActiveGameType(state),
  };
};

const AppContainer = connect(mapStateToProps, {
  updateActiveGameType,
})(App);

export default AppContainer;
