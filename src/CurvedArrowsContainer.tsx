import { connect } from "react-redux";

import { RootState } from "./store/rootReducer";
import CurvedArrows from "./CurvedArrows";
import { getFlatArrows } from "./features/arrows/arrows.selectors";
import { getCards } from "./features/cards/cards.selectors";

const mapStateToProps = (state: RootState) => {
  return {
    arrows: getFlatArrows(state),
    cards: getCards(state).cards,
  };
};

const CurvedArrowsContainer = connect(mapStateToProps, {})(CurvedArrows);

export default CurvedArrowsContainer;
