import { connect } from "react-redux";
import { GameType } from "./game-modules/GameModule";
import EncounterLoader from "./EncounterLoader";
import { getEncounterEntities } from "./features/cards-data/cards-data.selectors";

import { RootState } from "./store/rootReducer";

interface IProps {
  currentGameType: GameType;
}

const mapStateToProps = (state: RootState, ownProps: IProps) => {
  return {
    encounterData: getEncounterEntities(ownProps.currentGameType)(state),
  };
};

const EncounterLoaderContainer = connect(mapStateToProps, {})(EncounterLoader);

export default EncounterLoaderContainer;
