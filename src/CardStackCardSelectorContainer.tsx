import { connect } from "react-redux";
import CardStackCardSelector from "./CardStackCardSelector";
import { getCardsDataEntities } from "./features/cards-data/cards-data.selectors";

import { RootState } from "./store/rootReducer";

const mapStateToProps = (state: RootState) => {
  return {
    cardsDataEntities: getCardsDataEntities(state),
  };
};

const CardStackCardSelectorContainer = connect(
  mapStateToProps,
  {}
)(CardStackCardSelector);

export default CardStackCardSelectorContainer;
