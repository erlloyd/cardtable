import { connect } from "react-redux";
import PlaymatGroup from "./PlaymatGroup";
import { GamePropertiesMap } from "./constants/game-type-properties-mapping";
import { getActiveGameType } from "./features/game/game.selectors";
import { getPlaymatsInColumnRowOrder } from "./features/playmats/playmats.selectors";
import { RootState } from "./store/rootReducer";

const mapStateToProps = (state: RootState) => {
  const gameType = getActiveGameType(state);
  return {
    imgUrls: [
      !!gameType
        ? GamePropertiesMap[gameType].initialPlaymatImageLocation ||
          "/images/table/background_default.jpg"
        : "/images/table/background_default.jpg",
    ].concat(getPlaymatsInColumnRowOrder(state).map((p) => p.imgUrl)),
    startingPos: { x: 50, y: 50 },
    defaultLayoutDirection:
      !!gameType && !!GamePropertiesMap[gameType].additionalPlaymatImageOptions
        ? GamePropertiesMap[gameType].additionalPlaymatImageOptions!.layout
        : "row",
    customWidth: !!gameType
      ? GamePropertiesMap[gameType].customPlaymatWidth
      : undefined,
  };
};

const PlaymatGroupContainer = connect(mapStateToProps, {})(PlaymatGroup);

export default PlaymatGroupContainer;
