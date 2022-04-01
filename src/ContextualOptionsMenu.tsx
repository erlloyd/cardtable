// import { useState } from "react";
import "./ContextualOptionsMenu.scss";

import { GameType } from "./constants/app-constants";
import { CounterTokenType, StatusTokenType } from "./constants/card-constants";
import { Vector2d } from "konva/lib/types";
import Tooltip from "@material-ui/core/Tooltip";
import { useState } from "react";
import {
  GamePropertiesMap,
  NumericTokenInfo,
  TokenInfo,
} from "./constants/game-type-properties-mapping";
import { anyCardStackHasStatus } from "./utilities/card-utils";
import { ICardStack } from "./features/cards/initialState";

interface IProps {
  anyCardsSelected: boolean;
  currentGameType: GameType | null;
  panMode: boolean;
  multiselectMode: boolean;

  snapCardsToGrid: boolean;
  togglePanMode: () => void;
  toggleMultiselectMode: () => void;
  toggleToken: (payload: {
    id?: string;
    tokenType: StatusTokenType;
    value?: boolean;
  }) => void;
  adjustCounterToken: (payload: {
    id?: string;
    tokenType: CounterTokenType;
    delta?: number;
    value?: number;
  }) => void;
  showRadialMenuAtPosition: (payload: Vector2d) => void;
  showContextMenuAtPosition: (payload: Vector2d) => void;
  undo: () => void;
  redo: () => void;
  toggleDrawCardsIntoHand: () => void;
  toggleSnapCardsToGrid: () => void;
  drawCardsIntoHand: boolean;

  // For sure using
  playerNumber: number;
  selectedCardStacks: ICardStack[];
  flipCards: () => void;
  exhaustCard: (id?: string) => void;
  deleteCardStack: (id?: string) => void;
  shuffleStack: (id?: string) => void;
  clearCardTokens: (id?: string) => void;
  addToPlayerHand: (payload: { playerNumber: number }) => void;
  setDrawingArrow: (val: boolean) => void;
  startNewArrow: (id?: string) => void;
}

enum MenuType {
  NoMenu = "nomenu",
  StatusTokenActions = "statustokenactions",
  CounterTokenActions = "countertokenactions",
  ModifierActions = "modifieractions",
  DrawActions = "drawactions",
  DrawNumber = "drawnumber",
  ModifierNumber = "modifiernumber",
  ModifierExtraIcons = "modifierextraicons",
}

// enum DrawMode {
//   FaceUp = "faceup",
//   FaceDown = "facedown",
// }

const ContextualOptionsMenu = (props: IProps) => {
  const [visibleMenu, setVisibleMenu] = useState(MenuType.NoMenu);
  const [visibleMenuYPosition, setVisibleMenuYPosition] = useState(0);
  // const [currentDrawMode, setCurrentDrawMode] = useState(DrawMode.FaceDown);
  // const [currentModifier, setCurrentModifier] = useState("");

  if (!props.anyCardsSelected) {
    // reset our state
    if (visibleMenu !== MenuType.NoMenu) {
      setVisibleMenu(MenuType.NoMenu);
    }
    return null;
  }

  return (
    <div>
      <div className="contextual-options-menu">
        <Tooltip title="Flip cards">
          <button
            onClick={() => {
              props.flipCards();
            }}
          >
            Flip
          </button>
        </Tooltip>
        <Tooltip title="Exhaust / ready cards">
          <button
            onClick={() => {
              props.exhaustCard();
            }}
          >
            Exhaust
          </button>
        </Tooltip>
        <Tooltip title="Shuffle card stack">
          <button
            onClick={() => {
              props.shuffleStack();
            }}
          >
            Shuffle
          </button>
        </Tooltip>
        <Tooltip title="Clear card stack">
          <button
            onClick={() => {
              props.clearCardTokens();
            }}
          >
            Clear
          </button>
        </Tooltip>
        <Tooltip title="Delete card stack">
          <button
            onClick={() => {
              props.deleteCardStack();
            }}
          >
            Delete
          </button>
        </Tooltip>
        <Tooltip title="Draw into hand">
          <button
            onClick={() => {
              props.addToPlayerHand({
                playerNumber: props.playerNumber,
              });
            }}
          >
            Hand
          </button>
        </Tooltip>
        <Tooltip title="Start a new arrow">
          <button
            onClick={() => {
              props.setDrawingArrow(true);
              props.startNewArrow();
            }}
          >
            Arrow
          </button>
        </Tooltip>
        <Tooltip title="Set Statuses">
          <button
            onClick={(evt) => {
              if (visibleMenu === MenuType.StatusTokenActions) {
                setVisibleMenu(MenuType.NoMenu);
              } else {
                setVisibleMenu(MenuType.StatusTokenActions);
                setVisibleMenuYPosition(evt.clientY);
              }
            }}
          >
            Status
          </button>
        </Tooltip>
        <Tooltip title="Set Tokens">
          <button
            onClick={(evt) => {
              if (visibleMenu === MenuType.CounterTokenActions) {
                setVisibleMenu(MenuType.NoMenu);
              } else {
                setVisibleMenu(MenuType.CounterTokenActions);
                setVisibleMenuYPosition(evt.clientY);
              }
            }}
          >
            Token
          </button>
        </Tooltip>
      </div>

      {visibleMenu === MenuType.StatusTokenActions &&
        renderStatusTokenActionsSubMenu(props, visibleMenuYPosition)}

      {visibleMenu === MenuType.CounterTokenActions &&
        renderModifierTokenActionsSubMenu(props, visibleMenuYPosition)}
    </div>
  );
};

const renderStatusTokenActionsSubMenu = (props: IProps, ypos: number) => {
  if (!props.currentGameType) {
    return null;
  }

  const buttons = Object.values(GamePropertiesMap[props.currentGameType].tokens)
    .filter(
      (tokenInfo): tokenInfo is TokenInfo =>
        !!tokenInfo && !(tokenInfo as NumericTokenInfo).isNumeric
    )
    .map((tokenInfo) => {
      const action = () => {
        props.toggleToken({
          tokenType: tokenInfo.tokenType,
          value: !anyCardStackHasStatus(
            tokenInfo.tokenType,
            props.selectedCardStacks
          ),
        });
      };

      let key = `contextual-options-menu-button-${tokenInfo.menuText
        .replace(/\s/g, "")
        .toLocaleLowerCase()}`;

      return (
        <button key={key} onClick={action}>
          {tokenInfo.menuText}
        </button>
      );
    });

  return (
    <div
      className="contextual-options-menu inset"
      style={{ top: `${Math.max(ypos - 10, 0)}px` }}
    >
      {buttons}
    </div>
  );
};

const renderModifierTokenActionsSubMenu = (props: IProps, ypos: number) => {
  if (!props.currentGameType) {
    return null;
  }

  let buttons = Object.values(GamePropertiesMap[props.currentGameType].tokens)
    .filter(
      (tokenInfo): tokenInfo is NumericTokenInfo =>
        !!tokenInfo && (tokenInfo as NumericTokenInfo).isNumeric
    )
    .flatMap((tokenInfo) => {
      const addTokenInfo = {
        ...tokenInfo,
        touchMenuLetter: `${tokenInfo.touchMenuLetter} +`,
      };
      const removeTokenInfo = {
        ...tokenInfo,
        touchMenuLetter: `${tokenInfo.touchMenuLetter} -`,
      };
      return [addTokenInfo, removeTokenInfo];
    })
    .map((tokenInfo) => {
      const action = () => {
        props.adjustCounterToken({
          tokenType: tokenInfo.counterTokenType,
          delta: tokenInfo.touchMenuLetter?.indexOf("+") !== -1 ? 1 : -1,
        });
      };

      let key = `touch-menu-slice-${tokenInfo.menuText
        .replace(/\s/g, "")
        .toLocaleLowerCase()}`;

      key =
        key + (tokenInfo.touchMenuLetter?.indexOf("+") !== -1 ? "-plus" : "");
      return (
        <button key={key} onClick={action}>
          {tokenInfo.touchMenuLetter}
        </button>
      );
    });

  return (
    <div
      className="contextual-options-menu inset"
      style={{ top: `${Math.max(ypos - 10, 0)}px` }}
    >
      {buttons}
    </div>
  );
};

export default ContextualOptionsMenu;
