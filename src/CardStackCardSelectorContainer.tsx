import { connect } from "react-redux";
import CardStackCardSelector from "./CardStackCardSelector";
import { getCardsDataEntities } from "./features/cards-data/cards-data.selectors";
import {
  clearMenuPreviewCardJsonId,
  setMenuPreviewCardJsonId,
} from "./features/game/game.slice";

import { RootState } from "./store/rootReducer";
import { getActiveGameType } from "./features/game/game.selectors";
import { GameType } from "./game-modules/GameType";

const mapStateToProps = (state: RootState) => {
  return {
    currentGameType: getActiveGameType(state) ?? GameType.MarvelChampions,
    cardsDataEntities: getCardsDataEntities(state),
  };
};

const CardStackCardSelectorContainer = connect(mapStateToProps, {
  preview: setMenuPreviewCardJsonId,
  clearPreview: clearMenuPreviewCardJsonId,
})(CardStackCardSelector);

export default CardStackCardSelectorContainer;
