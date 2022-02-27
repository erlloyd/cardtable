import { connect } from "react-redux";

import { RootState } from "./store/rootReducer";
import CurvedArrows from "./CurvedArrows";
import { getArrows } from "./features/arrows/arrows.selectors";

const mapStateToProps = (state: RootState) => {
  return {
    arrows: getArrows(state).arrows,
  };
};

const CurvedArrowsContainer = connect(mapStateToProps, {})(CurvedArrows);

export default CurvedArrowsContainer;
