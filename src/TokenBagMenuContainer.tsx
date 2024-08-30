import { connect } from "react-redux";
import {
  getActiveGameType,
  getTokenBagMenu,
} from "./features/game/game.selectors";
import { getTokenBagById } from "./features/token-bags/token-bags.selectors";
import { GameType } from "./game-modules/GameType";
import { RootState } from "./store/rootReducer";
import TokenBagMenu from "./TokenBagMenu";
import {
  clearTokenBagMenu,
  showTokenBagEditor,
} from "./features/game/game.slice";
import { drawRandomTokenFromBag } from "./features/token-bags/token-bags.thunks";

const mapStateToProps = (state: RootState) => {
  const currentGameType = getActiveGameType(state) ?? GameType.MarvelChampions;
  const menuMetadata = getTokenBagMenu(state);
  return {
    currentGameType,
    position: menuMetadata?.position ?? null,
    bag: getTokenBagById(menuMetadata?.bagId ?? "")(state),
  };
};

const TokenBagMenuContainer = connect(mapStateToProps, {
  clearContextMenu: clearTokenBagMenu,
  showTokenBagEditor,
  drawRandomTokenFromBag,
})(TokenBagMenu);

export default TokenBagMenuContainer;
