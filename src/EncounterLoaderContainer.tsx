import { connect } from "react-redux";
import { GameType } from "./game-modules/GameModule";
import EncounterLoader from "./EncounterLoader";
import {
  getCardsDataEncounterEntitiesBySetCode,
  getCardsDataSetDataAsEncounterEntities,
} from "./features/cards-data/cards-data.selectors";

import { RootState } from "./store/rootReducer";

interface IProps {
  currentGameType: GameType;
}

const mapStateToProps = (state: RootState, ownProps: IProps) => {
  return {
    encounterData:
      ownProps.currentGameType === GameType.LordOfTheRingsLivingCardGame
        ? getCardsDataSetDataAsEncounterEntities(state)
        : getCardsDataEncounterEntitiesBySetCode(state),
  };
};

const EncounterLoaderContainer = connect(mapStateToProps, {})(EncounterLoader);

export default EncounterLoaderContainer;
