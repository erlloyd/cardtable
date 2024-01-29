import { connect } from "react-redux";
import PlaymatGroup from "./PlaymatGroup";
import { GamePropertiesMap } from "./constants/game-type-properties-mapping";
import { getActiveGameType } from "./features/game/game.selectors";
import {
  getPlaymatUrlsIncludeInitial,
  getPlaymatsInColumnRowOrder,
} from "./features/playmats/playmats.selectors";
import { RootState } from "./store/rootReducer";

const startingPos = { x: 50, y: 50 };

const mapStateToProps = (state: RootState) => {
  const gameType = getActiveGameType(state);
  return {
    imgUrls: getPlaymatUrlsIncludeInitial(
      state,
      !!gameType
        ? GamePropertiesMap[gameType].initialPlaymatImageLocation ||
            "/images/table/background_default.jpg"
        : "/images/table/background_default.jpg"
    ),
    startingPos,
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
