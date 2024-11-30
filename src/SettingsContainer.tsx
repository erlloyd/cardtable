import { connect } from "react-redux";
import {
  getSettings,
  isSettingsUiVisible,
} from "./features/game/game.selectors";
import Settings from "./Settings";
import { RootState } from "./store/rootReducer";
import { hideSettingsUi, updateSettings } from "./features/game/game.slice";

const mapStateToProps = (state: RootState) => {
  return {
    visible: isSettingsUiVisible(state),
    settings: getSettings(state),
  };
};

const SettingsContainer = connect(mapStateToProps, {
  hideSettingsUi,
  updateSettings,
})(Settings);

export default SettingsContainer;
