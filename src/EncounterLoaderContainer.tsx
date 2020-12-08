import { connect } from "react-redux";
import EncounterLoader from "./EncounterLoader";
import { getCardsDataEncounterEntitiesBySetCode } from "./features/cards-data/cards-data.selectors";

import { RootState } from "./store/rootReducer";

const mapStateToProps = (state: RootState) => {
  return {
    encounterData: getCardsDataEncounterEntitiesBySetCode(state),
  };
};

const EncounterLoaderContainer = connect(mapStateToProps, {})(EncounterLoader);

export default EncounterLoaderContainer;
