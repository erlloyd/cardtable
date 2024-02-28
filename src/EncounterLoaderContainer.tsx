import { connect } from "react-redux";
import { GameType } from "./game-modules/GameType";
import EncounterLoader from "./EncounterLoader";
import { getEncounterEntities } from "./features/cards-data/cards-data.selectors";

import { RootState } from "./store/rootReducer";

interface IProps {
  currentGameType: GameType;
  customCards: boolean;
}

const mapStateToProps = (state: RootState, ownProps: IProps) => {
  return {
    encounterData: getEncounterEntities(
      ownProps.currentGameType,
      ownProps.customCards
    )(state),
  };
};

const EncounterLoaderContainer = connect(mapStateToProps, {})(EncounterLoader);

export default EncounterLoaderContainer;
