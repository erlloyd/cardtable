import TopLayer from "./TopLayer";
import "./RemoteUndoOverlay.scss";

interface IProps {
  visible: boolean;
}

const RemoteUndoOverlay = (props: IProps) => {
  return props.visible ? (
    <TopLayer
      staticPosition={true}
      trasparentBackground={true}
      offsetContent={false}
      position={{ x: 0, y: 0 }}
      noPadding={true}
      fullHeight={true}
      fullWidth={true}
      completed={() => {}}
    >
      <div
        onClick={(event) => {
          event.stopPropagation();
        }}
        className="undo-overlay-wrapper"
      >
        Another player is undoing - please wait...
      </div>
    </TopLayer>
  ) : null;
};

export default RemoteUndoOverlay;
