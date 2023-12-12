import { connect } from "react-redux";
import { getAllCardsDataEntitesArrayWithoutDuplicates } from "./features/cards-data/cards-data.selectors";
import { getSpecificCardLoaderPosition } from "./features/game/game.selectors";
import {
  hideSpecificCardLoader,
  clearMenuPreviewCardJsonId,
  setMenuPreviewCardJsonId,
} from "./features/game/game.slice";
import SpecificCardLoader from "./SpecificCardLoader";
import { RootState } from "./store/rootReducer";

const mapStateToProps = (state: RootState) => {
  return {
    position: getSpecificCardLoaderPosition(state),
    heroData: getAllCardsDataEntitesArrayWithoutDuplicates(state),
  };
};

const SpecificCardLoaderContainer = connect(mapStateToProps, {
  hideSpecificCardLoader,
  preview: setMenuPreviewCardJsonId,
  clearPreview: clearMenuPreviewCardJsonId,
})(SpecificCardLoader);

export default SpecificCardLoaderContainer;
