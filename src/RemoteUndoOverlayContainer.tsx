import { connect } from "react-redux";
import RemoteUndoOverlay from "./RemoteUndoOverlay";
import { isRemoteUndoing } from "./features/game/game.selectors";
import { RootState } from "./store/rootReducer";

const mapStateToProps = (state: RootState) => {
  return {
    visible: isRemoteUndoing(state),
  };
};

const RemoteUndoOverlayContainer = connect(
  mapStateToProps,
  {}
)(RemoteUndoOverlay);

export default RemoteUndoOverlayContainer;
