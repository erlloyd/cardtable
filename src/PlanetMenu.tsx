import { Vector2d } from "konva/lib/types";
import React, { useState } from "react";
import TopLayer from "./TopLayer";
import { GameType } from "./constants/app-constants";
import {
  GamePropertiesMap,
  NumericTokenInfo,
  TokenInfo,
} from "./constants/game-type-properties-mapping";
import { CounterTokenType, StatusTokenType } from "./constants/card-constants";
import { DrawCardsOutOfCardStackPayload } from "./features/cards/cards.thunks";
import { ICardStack } from "./features/cards/initialState";
import { anyCardStackHasStatus } from "./utilities/card-utils";
import { Planet } from "react-planet";
import "./PlanetMenu.scss";
import {
  convertItemsToFanType,
  getRenderTypeByPosition,
  getRotFromRenderType,
  MenuData,
  RenderType,
  updateMenuDataForEvent,
} from "./PlanetMenuUtils";
// const reactPieMenu = require("react-pie-menu");
// const PieMenu = reactPieMenu.default;
// const { Slice } = reactPieMenu;

// enum MenuType {
//   TopLevelActions = "toplevelactions",
//   StatusTokenActions = "statustokenactions",
//   CounterTokenActions = "countertokenactions",
//   ModifierActions = "modifieractions",
//   DrawActions = "drawactions",
//   DrawNumber = "drawnumber",
//   ModifierNumber = "modifiernumber",
// }

enum DrawMode {
  FaceUp = "faceup",
  FaceDown = "facedown",
}

interface IProps {
  showCardSelector: (cardStack: ICardStack, isSelect: boolean) => void;
  selectedCardStacks: ICardStack[];
  currentGameType: GameType | null;
  position: Vector2d | null;
  hideRadialMenu: () => void;
  flipCards: () => void;
  exhaustCard: (id?: string) => void;
  shuffleStack: (id?: string) => void;
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
  clearCardTokens: (id?: string) => void;
  drawCardsOutOfCardStack: (payload: DrawCardsOutOfCardStackPayload) => void;
  adjustModifier: (payload: {
    id?: string;
    modifierId: string;
    delta?: number;
    value?: number;
  }) => void;
}

const PlanetMenu = (props: IProps) => {
  // const [visibleMenu, setVisibleMenu] = useState(MenuType.TopLevelActions);
  // const [currentDrawMode, setCurrentDrawMode] = useState(DrawMode.FaceDown);
  const [menuData, setMenuData] = useState({} as MenuData);

  // if (!props.position && visibleMenu !== MenuType.TopLevelActions) {
  //   setVisibleMenu(MenuType.TopLevelActions);
  // }

  const initialPosition = props.position
    ? {
        x: props.position.x - 32,
        y: props.position.y - 32,
      }
    : { x: 0, y: 0 };

  const renderType: RenderType = getRenderTypeByPosition(props.position);
  const rot = getRotFromRenderType(renderType);

  let orbitRadius: number | undefined = 190;
  if (renderType === RenderType.Normal) {
    orbitRadius = undefined;
  }

  return !!props.position ? (
    <TopLayer
      trasparentBackground={true}
      offsetContent={false}
      position={initialPosition}
      completed={() => {
        props.hideRadialMenu();
      }}
    >
      <div
        onClick={(event) => {
          event.stopPropagation();
          event.preventDefault();
        }}
      >
        <Planet
          centerContent={
            <div
              style={{
                display: "none",
              }}
            />
          }
          open
          hideOrbit
          orbitRadius={orbitRadius}
          rotation={rot}
        >
          {renderTopLevelMenu(props, menuData, setMenuData)}
        </Planet>
      </div>
    </TopLayer>
  ) : null;
};

const setParentPlanetZIndex = (
  evt: React.MouseEvent<HTMLDivElement, MouseEvent>
) => {
  const parent = getParentPlanet(evt);
  if (parent) parent.style.zIndex = "3";
};

const clearParentPlanetZIndex = (
  evt: React.MouseEvent<HTMLDivElement | HTMLDocument, MouseEvent>
) => {
  const parent = getParentPlanet(evt);
  if (parent) parent.style.zIndex = "";
};

const getParentPlanet = (
  evt: React.MouseEvent<HTMLDivElement | HTMLDocument, MouseEvent>
): HTMLElement | undefined => {
  let parent = (evt.target as any).closest(".makeStyles-root-3");
  if (!parent) {
    parent = (evt.target as any)
      .closest("div[class*=jss]")
      .parentNode?.parentNode?.closest("div[class*=jss]");
  }
  return parent;
};

const renderTopLevelMenu = (
  props: IProps,
  menuData: MenuData,
  setMenuData: (d: MenuData) => void
) => {
  if (!props.currentGameType) return null;

  const modifiers = GamePropertiesMap[props.currentGameType].modifiers;

  let topLevelPlanets = [
    <Planet
      key={"flip-slice"}
      onClick={() => {
        props.flipCards();
      }}
      centerContent={<div className="menu-orbit-item">Flip</div>}
    ></Planet>,
    <Planet
      key={"draw-menu-slice"}
      centerContent={
        <div
          onClick={(evt) => {
            setParentPlanetZIndex(evt);
            updateMenuDataForEvent(evt, "draw", menuData, setMenuData);
          }}
          className="menu-orbit-item"
        >
          Draw
        </div>
      }
      hideOrbit
      autoClose
      onClose={clearParentPlanetZIndex}
      rotation={menuData["draw"]?.rot ?? 0}
      orbitRadius={150}
    >
      {convertItemsToFanType(
        renderDrawMenu(props),
        menuData["draw"]?.renderType ?? RenderType.Normal
      )}
    </Planet>,
    <Planet
      key={"shuffle-slice"}
      onClick={() => {
        props.shuffleStack();
      }}
      centerContent={<div className="menu-orbit-item">Shuffle</div>}
    ></Planet>,
    <Planet
      key={"clear-slice"}
      onClick={() => {
        props.clearCardTokens();
      }}
      centerContent={<div className="menu-orbit-item">Clear</div>}
    ></Planet>,
    <Planet
      key={"tokens-slice"}
      centerContent={
        <div
          onClick={(evt) => {
            setParentPlanetZIndex(evt);
            updateMenuDataForEvent(evt, "tokens", menuData, setMenuData);
          }}
          className="menu-orbit-item"
        >
          Tokens
        </div>
      }
      hideOrbit
      autoClose
      onClose={clearParentPlanetZIndex}
      rotation={menuData["tokens"]?.rot ?? 0}
      orbitRadius={150}
    >
      {convertItemsToFanType(
        renderCounterTokensMenu(props),
        menuData["tokens"]?.renderType ?? RenderType.Normal
      )}
    </Planet>,
    <Planet
      key={"statuses-slice"}
      centerContent={
        <div
          onClick={(evt) => {
            setParentPlanetZIndex(evt);
            updateMenuDataForEvent(evt, "statuses", menuData, setMenuData);
          }}
          className="menu-orbit-item"
        >
          Statuses
        </div>
      }
      hideOrbit
      autoClose
      onClose={clearParentPlanetZIndex}
      rotation={menuData["statuses"]?.rot ?? 0}
      orbitRadius={150}
    >
      {convertItemsToFanType(
        renderStatusTokensMenu(props),
        menuData["statuses"]?.renderType ?? RenderType.Normal
      )}
    </Planet>,
    <Planet
      key={"exhaust-slice"}
      onClick={() => {
        props.exhaustCard();
      }}
      centerContent={<div className="menu-orbit-item">Exhaust</div>}
    ></Planet>,
  ];

  if (modifiers.length > 0) {
    topLevelPlanets.push(
      <Planet
        key={"modifiers-menu-slice"}
        centerContent={
          <div
            onClick={(evt) => {
              setParentPlanetZIndex(evt);
              updateMenuDataForEvent(evt, "modifiers", menuData, setMenuData);
            }}
            className="menu-orbit-item"
          >
            Modifiers
          </div>
        }
        hideOrbit
        autoClose
        onClose={clearParentPlanetZIndex}
        rotation={menuData["modifiers"]?.rot ?? 0}
        orbitRadius={150}
      >
        {convertItemsToFanType(
          renderModifierMenu(props) ?? [],
          menuData["modifiers"]?.renderType ?? RenderType.Normal
        )}
      </Planet>
    );
  }
  return convertItemsToFanType(
    topLevelPlanets,
    menuData["modifiers"]?.renderType ?? RenderType.Normal
  );
};

const renderStatusTokensMenu = (props: IProps) => {
  if (!props.currentGameType) {
    return [];
  }

  let slices = Object.values(GamePropertiesMap[props.currentGameType].tokens)
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

      let key = `touch-menu-slice-${tokenInfo.menuText
        .replace(/\s/g, "")
        .toLocaleLowerCase()}`;

      // key =
      //   key + (tokenInfo.touchMenuLetter?.indexOf("+") !== -1 ? "-plus" : "");
      return (
        <div
          className="menu-orbit-item nested-menu-item"
          key={key}
          onClick={action}
        >
          <div>{tokenInfo.menuText}</div>
        </div>
      );
    });

  return slices;
};

const renderCounterTokensMenu = (props: IProps) => {
  if (!props.currentGameType) {
    return [];
  }
  let slices = Object.values(GamePropertiesMap[props.currentGameType].tokens)
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
        <div
          className="menu-orbit-item nested-menu-item"
          key={key}
          onClick={action}
        >
          <div>{tokenInfo.touchMenuLetter}</div>
        </div>
      );
    });

  return slices;
};

const renderDrawMenu = (props: IProps) => {
  return [
    <Planet
      key={"find-card-slice"}
      centerContent={
        <div className="menu-orbit-item nested-menu-item">Find Card</div>
      }
      onClick={() => {
        if (props.selectedCardStacks.length === 1) {
          props.showCardSelector(props.selectedCardStacks[0], false);
          props.hideRadialMenu();
        }
      }}
    />,
    <Planet
      key={"select-card-slice"}
      centerContent={
        <div className="menu-orbit-item nested-menu-item">Select Card</div>
      }
      onClick={() => {
        if (props.selectedCardStacks.length === 1) {
          props.showCardSelector(props.selectedCardStacks[0], true);
          props.hideRadialMenu();
        }
      }}
    />,
    <Planet
      key={"draw-one-faceup-slice"}
      centerContent={
        <div className="menu-orbit-item nested-menu-item">1 faceup</div>
      }
      onClick={() => {
        if (props.selectedCardStacks.length === 1) {
          props.drawCardsOutOfCardStack({
            cardStackId: props.selectedCardStacks[0].id,
            numberToDraw: 1,
            facedown: false,
          });
        }
      }}
    />,
    <Planet
      key={"draw-one-facedown-slice"}
      centerContent={
        <div className="menu-orbit-item nested-menu-item">1 facedown</div>
      }
      onClick={() => {
        if (props.selectedCardStacks.length === 1) {
          props.drawCardsOutOfCardStack({
            cardStackId: props.selectedCardStacks[0].id,
            numberToDraw: 1,
            facedown: true,
          });
        }
      }}
    />,
    <Planet
      key={"draw-x-faceup-slice"}
      centerContent={
        <div
          onClick={setParentPlanetZIndex}
          className="menu-orbit-item nested-menu-item"
        >
          X faceup
        </div>
      }
      onClose={clearParentPlanetZIndex}
      autoClose
      hideOrbit
    >
      {renderDrawNumberMenu(props, DrawMode.FaceUp)}
    </Planet>,
    <Planet
      key={"draw-x-faceup-slice"}
      centerContent={
        <div
          onClick={setParentPlanetZIndex}
          className="menu-orbit-item nested-menu-item"
        >
          X facedown
        </div>
      }
      onClose={clearParentPlanetZIndex}
      autoClose
      hideOrbit
    >
      {renderDrawNumberMenu(props, DrawMode.FaceDown)}
    </Planet>,
  ];
};

const renderDrawNumberMenu = (props: IProps, currentDrawMode: DrawMode) => {
  return Array.from({ length: 10 }, (_, i) => i + 1).map((num) => {
    return (
      <div
        key={`draw-${num}-cards-slice`}
        className="menu-orbit-item double-nested-menu-item"
        onClick={() => {
          if (props.selectedCardStacks.length === 1) {
            props.drawCardsOutOfCardStack({
              cardStackId: props.selectedCardStacks[0].id,
              numberToDraw: num,
              facedown: currentDrawMode === DrawMode.FaceDown,
            });
          }
        }}
      >
        {num}
      </div>
    );
  });
};

const renderModifierMenu = (props: IProps) => {
  if (!props.currentGameType) return null;
  return GamePropertiesMap[props.currentGameType].modifiers.map((m) => {
    return (
      <Planet
        key={"modifier-slice"}
        centerContent={
          <div
            onClick={setParentPlanetZIndex}
            className="menu-orbit-item nested-menu-item"
          >
            {m.attributeName}
          </div>
        }
        onClose={clearParentPlanetZIndex}
        autoClose
        hideOrbit
      >
        {renderModifierNumberMenu(props, m.attributeId)}
      </Planet>
    );
  });
};

const renderModifierNumberMenu = (props: IProps, currentModifier: string) => {
  const basicNums = [
    <div
      key={`modifier-plus-one-slice`}
      className="menu-orbit-item double-nested-menu-item"
      onClick={() => {
        props.adjustModifier({ modifierId: currentModifier, delta: 1 });
      }}
    >
      Add 1
    </div>,
    <div
      key={`modifier-minus-one-slice`}
      className="menu-orbit-item double-nested-menu-item"
      onClick={() => {
        props.adjustModifier({ modifierId: currentModifier, delta: -1 });
      }}
    >
      Remove 1
    </div>,
    <div
      key={`modifier-zero-slice`}
      className="menu-orbit-item double-nested-menu-item"
      onClick={() => {
        props.adjustModifier({ modifierId: currentModifier, value: 0 });
      }}
    >
      0
    </div>,
  ];

  const allNums = basicNums
    .concat(
      Array.from({ length: 3 }, (_, i) => i + 1).map((num) => {
        return (
          <div
            key={`modifier-pos-${num}-cards-slice`}
            className="menu-orbit-item double-nested-menu-item"
            onClick={() => {
              props.adjustModifier({ modifierId: currentModifier, value: num });
            }}
          >
            {num}
          </div>
        );
      })
    )
    .concat(
      Array.from({ length: 3 }, (_, i) => i + 1).map((num) => {
        return (
          <div
            key={`modifier-neg-${num}-cards-slice`}
            className="menu-orbit-item double-nested-menu-item"
            onClick={() => {
              props.adjustModifier({
                modifierId: currentModifier,
                value: num * -1,
              });
            }}
          >
            {num * -1}
          </div>
        );
      })
    );

  return allNums;
};

export default PlanetMenu;
