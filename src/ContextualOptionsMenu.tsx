// import { useState } from "react";
import "./ContextualOptionsMenu.scss";

import { GameType } from "./game-modules/GameType";
import { CounterTokenType, StatusTokenType } from "./constants/card-constants";
import { Vector2d } from "konva/lib/types";
import Tooltip from "@mui/material/Tooltip";
import { useState } from "react";
import { GamePropertiesMap } from "./constants/game-type-properties-mapping";
import { anyCardStackHasStatus } from "./utilities/card-utils";
import { ICardStack } from "./features/cards/initialState";
import { DrawCardsOutOfCardStackPayload } from "./features/cards/cards.thunks";
import { NumericTokenInfo, TokenInfo } from "./game-modules/GameModule";
import GameManager from "./game-modules/GameModuleManager";

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
  adjustStatusToken: (payload: {
    id?: string;
    tokenType: StatusTokenType;
    delta: number;
  }) => void;
  adjustCounterToken: (payload: {
    id?: string;
    tokenType: CounterTokenType;
    delta?: number;
    value?: number;
  }) => void;
  showRadialMenuAtPosition: (payload: Vector2d) => void;
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
  addToPlayerHandWithRoleCheck: (payload: { playerNumber: number }) => void;
  setDrawingArrow: (val: boolean) => void;
  startNewArrow: (id?: string) => void;
  adjustModifier: (payload: {
    id?: string;
    modifierId: string;
    delta?: number;
    value?: number;
  }) => void;
  toggleExtraIcon: (icon: string) => void;
  showCardSelector: (cardStack: ICardStack, isSelect: boolean) => void;
  drawCardsOutOfCardStack: (payload: DrawCardsOutOfCardStackPayload) => void;
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

enum DrawMode {
  FaceUp = "faceup",
  FaceDown = "facedown",
}

const ContextualOptionsMenu = (props: IProps) => {
  const [visibleMenus, setVisibleMenus] = useState<MenuType[]>([]);
  const [visibleMenuYPosition, setVisibleMenuYPosition] = useState(0);
  const [currentDrawMode, setCurrentDrawMode] = useState(DrawMode.FaceDown);
  const [currentModifier, setCurrentModifier] = useState("");

  if (!props.anyCardsSelected) {
    // reset our state
    if (visibleMenus.length !== 0) {
      setVisibleMenus([]);
    }
    return null;
  }
  let hasMods = false;
  let hasStatusTokens = false;
  let hasCounterTokens = false;
  if (props.currentGameType) {
    const currentProperties = GameManager.getModuleForType(
      props.currentGameType
    ).properties;

    hasMods = currentProperties.modifiers.length > 0;
    hasStatusTokens =
      !!currentProperties.tokens.stunned ||
      !!currentProperties.tokens.confused ||
      !!currentProperties.tokens.tough;
    hasCounterTokens =
      !!currentProperties.tokens.damage ||
      !!currentProperties.tokens.threat ||
      !!currentProperties.tokens.generic ||
      !!currentProperties.tokens.acceleration;
  }

  return (
    <div>
      <div className="contextual-options-menu">
        <Tooltip title="Get Cards from stack">
          <button
            onClick={(evt) => {
              if (visibleMenus.includes(MenuType.DrawActions)) {
                setVisibleMenus([]);
              } else {
                setVisibleMenus([MenuType.DrawActions]);
                setVisibleMenuYPosition(evt.clientY);
              }
            }}
          >
            Draw
          </button>
        </Tooltip>
        {hasMods && (
          <Tooltip title="Set Modifiers">
            <button
              onClick={(evt) => {
                if (visibleMenus.includes(MenuType.ModifierActions)) {
                  setVisibleMenus([]);
                } else {
                  setVisibleMenus([MenuType.ModifierActions]);
                  setVisibleMenuYPosition(evt.clientY);
                }
              }}
            >
              Mods
            </button>
          </Tooltip>
        )}
        {hasStatusTokens && (
          <Tooltip title="Set Statuses">
            <button
              onClick={(evt) => {
                if (visibleMenus.includes(MenuType.StatusTokenActions)) {
                  setVisibleMenus([]);
                } else {
                  setVisibleMenus([MenuType.StatusTokenActions]);
                  setVisibleMenuYPosition(evt.clientY);
                }
              }}
            >
              Status
            </button>
          </Tooltip>
        )}
        {hasCounterTokens && (
          <Tooltip title="Set Tokens">
            <button
              onClick={(evt) => {
                if (visibleMenus.includes(MenuType.CounterTokenActions)) {
                  setVisibleMenus([]);
                } else {
                  setVisibleMenus([MenuType.CounterTokenActions]);
                  setVisibleMenuYPosition(evt.clientY);
                }
              }}
            >
              Token
            </button>
          </Tooltip>
        )}
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
              props.addToPlayerHandWithRoleCheck({
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
      </div>

      {visibleMenus.includes(MenuType.StatusTokenActions) &&
        renderStatusTokenActionsSubMenu(props, visibleMenuYPosition)}

      {visibleMenus.includes(MenuType.CounterTokenActions) &&
        renderModifierTokenActionsSubMenu(props, visibleMenuYPosition)}

      {visibleMenus.includes(MenuType.ModifierActions) &&
        renderModifierActionsSubMenu(
          props,
          visibleMenus,
          currentModifier,
          setVisibleMenus,
          setCurrentModifier,
          visibleMenuYPosition
        )}

      {visibleMenus.includes(MenuType.ModifierNumber) &&
        renderModifierNumberSubMenu(
          props,
          currentModifier,
          visibleMenuYPosition
        )}

      {visibleMenus.includes(MenuType.ModifierExtraIcons) &&
        renderModifierExtraIconsSubMenu(props, visibleMenuYPosition)}

      {visibleMenus.includes(MenuType.DrawActions) &&
        renderDrawActionsSubMenu(
          props,
          visibleMenus,
          currentDrawMode,
          setVisibleMenus,
          setCurrentDrawMode,
          visibleMenuYPosition
        )}

      {visibleMenus.includes(MenuType.DrawNumber) &&
        renderDrawNumberSubMenu(
          props,
          currentDrawMode,
          setVisibleMenus,
          visibleMenuYPosition
        )}
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
    .reduce((elements, tokenInfo) => {
      const action = () => {
        props.toggleToken({
          tokenType: tokenInfo.tokenType,
          value: !anyCardStackHasStatus(
            tokenInfo.tokenType,
            props.selectedCardStacks
          ),
        });
      };

      const addAction = () => {
        props.adjustStatusToken({
          tokenType: tokenInfo.tokenType,
          delta: 1,
        });
      };

      const removeAction = () => {
        props.adjustStatusToken({
          tokenType: tokenInfo.tokenType,
          delta: -1,
        });
      };

      let key = `contextual-options-menu-button-${tokenInfo.menuText
        .replace(/\s/g, "")
        .toLocaleLowerCase()}`;

      let buttons = [
        <button key={key} onClick={action}>
          {tokenInfo.menuText}
        </button>,
      ];

      if (tokenInfo.canStackMultiple) {
        buttons = [
          <button key={key} onClick={addAction}>
            {tokenInfo.menuText}+
          </button>,
          <button key={key} onClick={removeAction}>
            {tokenInfo.menuText}-
          </button>,
        ];
      }

      return elements.concat(buttons);
    }, [] as JSX.Element[]);

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

      let key = `touch-menu-button-${tokenInfo.menuText
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

const renderModifierActionsSubMenu = (
  props: IProps,
  visibleMenus: MenuType[],
  currentModifier: string,
  setVisibleMenus: (m: MenuType[]) => void,
  setCurrentModifier: (mod: string) => void,
  ypos: number
) => {
  if (!props.currentGameType) return null;

  const possibleIcons = GamePropertiesMap[props.currentGameType].possibleIcons;

  const buttons = GamePropertiesMap[props.currentGameType].modifiers
    .map((m) => {
      return (
        <button
          key={"modifier-button"}
          onClick={() => {
            if (
              visibleMenus.includes(MenuType.ModifierNumber) &&
              currentModifier === m.attributeId
            ) {
              setVisibleMenus(
                visibleMenus.filter((m) => m !== MenuType.ModifierNumber)
              );
            } else {
              setCurrentModifier(m.attributeId);
              //show the modifier number menu, but only if it's not
              // already visible
              if (!visibleMenus.includes(MenuType.ModifierNumber)) {
                setVisibleMenus(
                  visibleMenus
                    .filter((m) => m !== MenuType.ModifierExtraIcons)
                    .concat([MenuType.ModifierNumber])
                );
              }
            }
          }}
        >
          {m.attributeName}
        </button>
      );
    })
    .concat(
      possibleIcons.length > 0
        ? [
            <button
              key={"extra-icons-button"}
              onClick={() => {
                // If the number submenu is open, close it
                setVisibleMenus(
                  visibleMenus
                    .filter((m) => m !== MenuType.ModifierNumber)
                    .concat([MenuType.ModifierExtraIcons])
                );
              }}
            >
              Extra Icons
            </button>,
          ]
        : []
    );

  return (
    <div
      className="contextual-options-menu inset"
      style={{ top: `${Math.max(ypos - 10, 0)}px` }}
    >
      {buttons}
    </div>
  );
};

const renderModifierNumberSubMenu = (
  props: IProps,
  currentModifier: string,
  ypos: number
) => {
  const basicNums = [
    <button
      key={`modifier-plus-one-button`}
      onClick={() => {
        props.adjustModifier({ modifierId: currentModifier, delta: 1 });
      }}
    >
      Add 1
    </button>,
    <button
      key={`modifier-minus-one-button`}
      onClick={() => {
        props.adjustModifier({ modifierId: currentModifier, delta: -1 });
      }}
    >
      Remove 1
    </button>,
    <button
      key={`modifier-zero-button`}
      onClick={() => {
        props.adjustModifier({ modifierId: currentModifier, value: 0 });
      }}
    >
      0
    </button>,
  ];

  const allNums = basicNums
    .concat(
      Array.from({ length: 3 }, (_, i) => i + 1).map((num) => {
        return (
          <button
            key={`modifier-pos-${num}-cards-button`}
            onClick={() => {
              props.adjustModifier({ modifierId: currentModifier, value: num });
            }}
          >
            {num}
          </button>
        );
      })
    )
    .concat(
      Array.from({ length: 3 }, (_, i) => i + 1).map((num) => {
        return (
          <button
            key={`modifier-neg-${num}-cards-button`}
            onClick={() => {
              props.adjustModifier({
                modifierId: currentModifier,
                value: num * -1,
              });
            }}
          >
            {num * -1}
          </button>
        );
      })
    );

  return (
    <div
      className="contextual-options-menu inset2"
      style={{ top: `${Math.max(ypos - 10, 0)}px` }}
    >
      {allNums}
    </div>
  );
};

const renderModifierExtraIconsSubMenu = (props: IProps, ypos: number) => {
  if (!props.currentGameType) return null;

  const allIcons = GamePropertiesMap[props.currentGameType].possibleIcons.map(
    (icon) => (
      <button
        key={`modifier-extra-icon-${icon.iconId}`}
        onClick={() => {
          props.toggleExtraIcon(icon.iconId);
        }}
      >
        {icon.iconName}
      </button>
    )
  );
  return (
    <div
      className="contextual-options-menu inset2"
      style={{ top: `${Math.max(ypos - 10, 0)}px` }}
    >
      {allIcons}
    </div>
  );
};

const renderDrawActionsSubMenu = (
  props: IProps,
  visibleMenus: MenuType[],
  currentDrawMode: string,
  setVisibleMenus: (m: MenuType[]) => void,
  setCurrentDrawMode: (mod: DrawMode) => void,
  ypos: number
) => {
  const drawMenu = [
    <button
      key={"find-card-button"}
      onClick={() => {
        if (props.selectedCardStacks.length === 1) {
          props.showCardSelector(props.selectedCardStacks[0], false);
          setVisibleMenus([]);
        }
      }}
    >
      Find Card
    </button>,
    <button
      key={"Select-cards-button"}
      onClick={() => {
        if (props.selectedCardStacks.length === 1) {
          props.showCardSelector(props.selectedCardStacks[0], true);
          setVisibleMenus([]);
        }
      }}
    >
      Select Card
    </button>,
    <button
      key={"draw-one-faceup-button"}
      onClick={() => {
        if (props.selectedCardStacks.length === 1) {
          props.drawCardsOutOfCardStack({
            cardStackId: props.selectedCardStacks[0].id,
            numberToDraw: 1,
            facedown: false,
          });
          setVisibleMenus([]);
        }
      }}
    >
      1 faceup
    </button>,
    <button
      key={"draw-one-facedown-button"}
      onClick={() => {
        if (props.selectedCardStacks.length === 1) {
          props.drawCardsOutOfCardStack({
            cardStackId: props.selectedCardStacks[0].id,
            numberToDraw: 1,
            facedown: true,
          });
          setVisibleMenus([]);
        }
      }}
    >
      1 facedown
    </button>,
    <button
      key={"draw-x-faceup-button"}
      onClick={() => {
        if (
          visibleMenus.includes(MenuType.DrawNumber) &&
          currentDrawMode === DrawMode.FaceUp
        ) {
          setVisibleMenus(
            visibleMenus.filter((m) => m !== MenuType.DrawNumber)
          );
        }
        setCurrentDrawMode(DrawMode.FaceUp);
        if (!visibleMenus.includes(MenuType.DrawNumber)) {
          setVisibleMenus([...visibleMenus, MenuType.DrawNumber]);
        }
      }}
    >
      X faceup
    </button>,
    <button
      key={"draw-x-facedown-button"}
      onClick={() => {
        if (
          visibleMenus.includes(MenuType.DrawNumber) &&
          currentDrawMode === DrawMode.FaceDown
        ) {
          setVisibleMenus(
            visibleMenus.filter((m) => m !== MenuType.DrawNumber)
          );
        }
        setCurrentDrawMode(DrawMode.FaceDown);
        if (!visibleMenus.includes(MenuType.DrawNumber)) {
          setVisibleMenus([...visibleMenus, MenuType.DrawNumber]);
        }
      }}
    >
      X facedown
    </button>,
    <button
      key={"add-to-hand-button"}
      onClick={() => {
        props.addToPlayerHandWithRoleCheck({
          playerNumber: props.playerNumber,
        });
        setVisibleMenus([]);
      }}
    >
      All to hand
    </button>,
  ];

  const renderDrawMenuItems = drawMenu.filter((mi) => {
    if (
      !!mi.key &&
      mi.key.toString().includes("facedown") &&
      props.drawCardsIntoHand
    ) {
      return false;
    } else {
      return true;
    }
  });

  return (
    <div
      className="contextual-options-menu inset"
      style={{ top: `${Math.max(ypos - 10, 0)}px` }}
    >
      {renderDrawMenuItems}
    </div>
  );
};

const renderDrawNumberSubMenu = (
  props: IProps,
  currentDrawMode: DrawMode,
  setVisibleMenus: (m: MenuType[]) => void,
  ypos: number
) => {
  const buttons = Array.from({ length: 10 }, (_, i) => i + 1).map((num) => {
    return (
      <button
        key={`draw-${num}-cards-button`}
        onClick={() => {
          if (props.selectedCardStacks.length === 1) {
            props.drawCardsOutOfCardStack({
              cardStackId: props.selectedCardStacks[0].id,
              numberToDraw: num,
              facedown: currentDrawMode === DrawMode.FaceDown,
            });
            setVisibleMenus([]);
          }
        }}
      >
        {num}
      </button>
    );
  });

  return (
    <div
      className="contextual-options-menu inset2"
      style={{ top: `${Math.max(ypos - 10, 0)}px` }}
    >
      {buttons}
    </div>
  );
};

export default ContextualOptionsMenu;
