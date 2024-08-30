import { Vector2d } from "konva/lib/types";
import { ITokenBag } from "./features/token-bags/initialState";
import { GameType } from "./game-modules/GameType";
import ContextMenu, { ContextMenuItem } from "./ContextMenu";

interface IProps {
  currentGameType: GameType;
  position: Vector2d | null;
  bag: ITokenBag | null;

  clearContextMenu: () => void;
  showTokenBagEditor: (bag: ITokenBag) => void;
  drawRandomTokenFromBag: (bagId: string) => void;
}

const TokenBagMenu = (props: IProps) => {
  if (!props.position) return null;

  const menuItems: ContextMenuItem[] = [
    {
      label: "Draw random token",
      action: () => {
        props.drawRandomTokenFromBag(props.bag?.id ?? "");
      },
    },
    {
      label: "Add or remove tokens",
      action: () => {
        if (!!props.bag) {
          props.showTokenBagEditor(props.bag);
        }
      },
    },
    {
      label: "Show tokens",
    },
  ];

  return (
    <ContextMenu
      position={props.position}
      items={menuItems}
      hideContextMenu={() => props.clearContextMenu()}
    ></ContextMenu>
  );
};

export default TokenBagMenu;
