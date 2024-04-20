import { Button } from "@mui/material";
import "./Changelog.scss";
import TopLayer from "./TopLayer";
import { IChangelogEntry } from "./features/game/initialState";

interface IProps {
  showChangelog: boolean;
  mostRecentChangelog: IChangelogEntry[] | null;
  toggleShowCurrentChangelog: () => void;
}

const Changelog = (props: IProps) => {
  return (
    props.showChangelog && (
      <TopLayer
        staticPosition={true}
        trasparentBackground={true}
        offsetContent={false}
        position={{ x: 0, y: 0 }}
        noPadding={true}
        fullHeight={true}
        fullWidth={true}
        completed={props.toggleShowCurrentChangelog}
      >
        <div
          className="changelog-container"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="changelog">
            {props.mostRecentChangelog ? (
              props.mostRecentChangelog.map((ce) => {
                return (
                  <div className="version-group">
                    <div className="version-string">{ce.version}</div>
                    <div className="message-string">{ce.message}</div>
                  </div>
                );
              })
            ) : (
              <div>Loading changelog...</div>
            )}
          </div>
          <div className="buttons">
            <Button
              variant="outlined"
              onClick={props.toggleShowCurrentChangelog}
            >
              Close
            </Button>
          </div>
        </div>
      </TopLayer>
    )
  );
};

export default Changelog;
