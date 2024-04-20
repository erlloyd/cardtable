import { connect } from "react-redux";
import Changelog from "./Changelog";
import {
  getMostRecentChangelog,
  getShowChangelog,
} from "./features/game/game.selectors";
import { toggleShowCurrentChangelog } from "./features/game/game.slice";
import { RootState } from "./store/rootReducer";

const mapStateToProps = (state: RootState) => {
  return {
    showChangelog: getShowChangelog(state),
    mostRecentChangelog: getMostRecentChangelog(state),
  };
};

const ChangelogContainer = connect(mapStateToProps, {
  toggleShowCurrentChangelog,
})(Changelog);

export default ChangelogContainer;
