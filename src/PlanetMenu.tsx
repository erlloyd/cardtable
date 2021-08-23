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
// const reactPieMenu = require("react-pie-menu");
// const PieMenu = reactPieMenu.default;
// const { Slice } = reactPieMenu;

enum MenuType {
  TopLevelActions = "toplevelactions",
  StatusTokenActions = "statustokenactions",
  CounterTokenActions = "countertokenactions",
  ModifierActions = "modifieractions",
  DrawActions = "drawactions",
  DrawNumber = "drawnumber",
  ModifierNumber = "modifiernumber",
}

enum RenderType {
  Normal = "normal",
  LeftFan = "leftfan",
  RightFan = "rightfan",
  TopFan = "topfan",
  BottomFan = "bottomfan",
  LowerRightFan = "lowerrightfan",
  LowerLeftFan = "lowerleftfan",
  UpperRightFan = "upperrightfan",
  UpperLeftFan = "upperleftfan",
}

// enum DrawMode {
//   FaceUp = "faceup",
//   FaceDown = "facedown",
// }

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
  const [visibleMenu, setVisibleMenu] = useState(MenuType.TopLevelActions);
  // const [currentDrawMode, setCurrentDrawMode] = useState(DrawMode.FaceDown);
  // const [currentModifier, setCurrentModifier] = useState("");

  if (!props.position && visibleMenu !== MenuType.TopLevelActions) {
    setVisibleMenu(MenuType.TopLevelActions);
  }
  const minScreenOffset = 128;
  const maxScreenOffset = 190;
  const initialPosition = props.position
    ? {
        x: props.position.x - 32,
        y: props.position.y - 32,
      }
    : { x: 0, y: 0 };
  const adjustedPosition = props.position
    ? {
        x: Math.min(
          Math.max(props.position.x - 32, minScreenOffset),
          window.visualViewport.width - maxScreenOffset
        ),
        y: Math.min(
          Math.max(props.position.y - 32, minScreenOffset),
          window.visualViewport.height - maxScreenOffset
        ),
      }
    : { x: 0, y: 0 };

  let renderType: RenderType = RenderType.Normal;
  // Determine the fan type
  if (!props.position) {
    renderType = RenderType.Normal;
  } else if (
    props.position.x === adjustedPosition.x + 32 &&
    props.position.y !== adjustedPosition.y + 32 &&
    adjustedPosition.y === minScreenOffset
  ) {
    renderType = RenderType.BottomFan;
  } else if (
    props.position.y === adjustedPosition.y + 32 &&
    props.position.x !== adjustedPosition.x + 32 &&
    adjustedPosition.x === minScreenOffset
  ) {
    renderType = RenderType.RightFan;
  } else if (
    props.position.x === adjustedPosition.x + 32 &&
    props.position.y !== adjustedPosition.y + 32 &&
    adjustedPosition.y === window.visualViewport.height - maxScreenOffset
  ) {
    renderType = RenderType.TopFan;
  } else if (
    props.position.y === adjustedPosition.y + 32 &&
    props.position.x !== adjustedPosition.x + 32 &&
    adjustedPosition.x === window.visualViewport.width - maxScreenOffset
  ) {
    renderType = RenderType.LeftFan;
  } else if (
    props.position.x !== adjustedPosition.x + 32 &&
    props.position.y !== adjustedPosition.y + 32 &&
    adjustedPosition.x === minScreenOffset &&
    adjustedPosition.y === minScreenOffset
  ) {
    renderType = RenderType.LowerRightFan;
  } else if (
    props.position.x !== adjustedPosition.x + 32 &&
    props.position.y !== adjustedPosition.y + 32 &&
    adjustedPosition.x === window.visualViewport.width - maxScreenOffset &&
    adjustedPosition.y === window.visualViewport.height - maxScreenOffset
  ) {
    renderType = RenderType.UpperLeftFan;
  } else if (
    props.position.x !== adjustedPosition.x + 32 &&
    props.position.y !== adjustedPosition.y + 32 &&
    adjustedPosition.x === minScreenOffset &&
    adjustedPosition.y === window.visualViewport.height - maxScreenOffset
  ) {
    renderType = RenderType.UpperRightFan;
  } else if (
    props.position.x !== adjustedPosition.x + 32 &&
    props.position.y !== adjustedPosition.y + 32 &&
    adjustedPosition.x === window.visualViewport.width - maxScreenOffset &&
    adjustedPosition.y === minScreenOffset
  ) {
    renderType = RenderType.LowerLeftFan;
  }

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
        >
          {renderTopLevelMenu(props, renderType)}
        </Planet>
      </div>
    </TopLayer>
  ) : null;
};

// const renderMenuSlices = (
//   visibleMenu: MenuType,
//   setVisibleMenu: (type: MenuType) => void,
//   currentDrawMode: DrawMode,
//   setCurrentDrawMode: (mode: DrawMode) => void,
//   currentModifier: string,
//   setCurrentModifer: (mod: string) => void,
//   props: IProps
// ) => {
//   let slices: JSX.Element[] | null = null;
//   let backMenu: MenuType | null = null;

//   switch (visibleMenu) {
//     case MenuType.StatusTokenActions:
//       slices = renderStatusTokensMenu(props);
//       backMenu = MenuType.TopLevelActions;
//       break;
//     case MenuType.CounterTokenActions:
//       slices = renderCounterTokensMenu(props);
//       backMenu = MenuType.TopLevelActions;
//       break;
//     case MenuType.DrawActions:
//       slices = renderDrawMenu(props, setVisibleMenu, setCurrentDrawMode);
//       backMenu = MenuType.TopLevelActions;
//       break;
//     case MenuType.DrawNumber:
//       slices = renderDrawNumberMenu(props, currentDrawMode);
//       backMenu = MenuType.DrawActions;
//       break;
//     case MenuType.ModifierActions:
//       slices = renderModifierMenu(props, setVisibleMenu, setCurrentModifer);
//       backMenu = MenuType.TopLevelActions;
//       break;
//     case MenuType.ModifierNumber:
//       slices = renderModifierNumberMenu(props, currentModifier);
//       backMenu = MenuType.ModifierActions;
//       break;
//     case MenuType.TopLevelActions:
//     default:
//       slices = renderTopLevelMenu(props, setVisibleMenu);
//   }
//   if (!!backMenu) {
//     slices = renderMenuWithBackButton(slices, backMenu, setVisibleMenu);
//   }

//   return slices;
// };

// const renderMenuWithBackButton = (
//   slices: JSX.Element[] | null,
//   backMenu: MenuType,
//   setVisibleMenu: (type: MenuType) => void
// ): JSX.Element[] | null => {
//   if (!slices) return null;

//   const back = (
//     <Slice
//       key={"back-slice"}
//       onSelect={() => {
//         setVisibleMenu(backMenu);
//       }}
//     >
//       Back
//     </Slice>
//   );

//   return [back].concat(slices);
// };

const renderTopLevelMenu = (props: IProps, renderType: RenderType) => {
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
      centerContent={<div className="menu-orbit-item">Draw</div>}
    ></Planet>,
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
            const parent = (evt.target as any).closest(".makeStyles-root-3");
            if (parent) parent.style.zIndex = 3;
          }}
          className="menu-orbit-item"
        >
          Tokens
        </div>
      }
      hideOrbit
      autoClose
      onClose={(evt) => {
        const parent = (evt.target as any).closest(".makeStyles-root-3");
        if (parent) parent.style.zIndex = "";
      }}
    >
      {renderCounterTokensMenu(props)}
    </Planet>,
    <Planet
      key={"statuses-slice"}
      centerContent={
        <div
          onClick={(evt) => {
            const parent = (evt.target as any).closest(".makeStyles-root-3");
            if (parent) parent.style.zIndex = 3;
          }}
          className="menu-orbit-item"
        >
          Statuses
        </div>
      }
      hideOrbit
      autoClose
      onClose={(evt) => {
        const parent = (evt.target as any).closest(".makeStyles-root-3");
        if (parent) parent.style.zIndex = "";
      }}
    >
      {renderStatusTokensMenu(props)}
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
              const parent = (evt.target as any).closest(".makeStyles-root-3");
              if (parent) parent.style.zIndex = 3;
            }}
            className="menu-orbit-item"
          >
            Modifiers
          </div>
        }
        hideOrbit
        autoClose
        onClose={(evt) => {
          const parent = (evt.target as any).closest(".makeStyles-root-3");
          if (parent) parent.style.zIndex = "";
        }}
      ></Planet>
    );
  }

  const halfNumber = Math.floor(topLevelPlanets.length / 2);
  const quarterNumber = Math.floor(topLevelPlanets.length / 4);
  const half = Math.ceil(topLevelPlanets.length / 2);
  const quarter = Math.ceil(topLevelPlanets.length / 4);
  const firstHalf = topLevelPlanets.slice(0, half);
  const secondHalf = topLevelPlanets.slice(-half);
  const firstQuarter = topLevelPlanets.slice(0, quarter);
  const last3_4ths = topLevelPlanets.slice(quarter);
  const first3_4ths = topLevelPlanets.slice(
    0,
    topLevelPlanets.length - quarter
  );
  const lastQuarter = topLevelPlanets.slice(topLevelPlanets.length - quarter);

  switch (renderType) {
    case RenderType.RightFan:
      topLevelPlanets = Array(topLevelPlanets.length)
        .map(() => {
          return <div></div>;
        })
        .concat(topLevelPlanets);
      break;

    case RenderType.LeftFan:
      topLevelPlanets = topLevelPlanets.concat(
        Array(topLevelPlanets.length).map(() => {
          return <div></div>;
        })
      );
      break;

    case RenderType.TopFan:
      topLevelPlanets = Array(Math.floor(topLevelPlanets.length / 2))
        .map(() => {
          return <div></div>;
        })
        .concat(topLevelPlanets)
        .concat(
          Array(Math.floor(topLevelPlanets.length / 2)).map(() => {
            return <div></div>;
          })
        );
      break;

    case RenderType.BottomFan:
      topLevelPlanets = firstHalf
        .concat(
          Array(topLevelPlanets.length).map(() => {
            return <div></div>;
          })
        )
        .concat(secondHalf);
      break;

    case RenderType.UpperLeftFan:
      topLevelPlanets = Array(quarterNumber)
        .map(() => {
          return <div></div>;
        })
        .concat(topLevelPlanets)
        .concat(
          Array(halfNumber + quarterNumber).map(() => {
            return <div></div>;
          })
        );
      break;

    case RenderType.UpperRightFan:
      topLevelPlanets = Array(halfNumber + quarterNumber)
        .map(() => {
          return <div></div>;
        })
        .concat(topLevelPlanets)
        .concat(
          Array(quarterNumber).map(() => {
            return <div></div>;
          })
        );
      break;

    case RenderType.LowerLeftFan:
      topLevelPlanets = first3_4ths
        .concat(Array(topLevelPlanets.length))
        .concat(lastQuarter);
      break;

    case RenderType.LowerRightFan:
      topLevelPlanets = firstQuarter
        .concat(Array(topLevelPlanets.length))
        .concat(last3_4ths);
      break;
  }

  return topLevelPlanets;
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

// const renderDrawMenu = (
//   props: IProps,
//   setVisibleMenu: (type: MenuType) => void,
//   setCurrentDrawMode: (mode: DrawMode) => void
// ) => {
//   return [
//     <Slice
//       key={"find-card-slice"}
//       onSelect={() => {
//         if (props.selectedCardStacks.length === 1) {
//           props.showCardSelector(props.selectedCardStacks[0], false);
//           props.hideRadialMenu();
//         }
//       }}
//     >
//       Find Card
//     </Slice>,
//     <Slice
//       key={"Select-cards-slice"}
//       onSelect={() => {
//         if (props.selectedCardStacks.length === 1) {
//           props.showCardSelector(props.selectedCardStacks[0], true);
//           props.hideRadialMenu();
//         }
//       }}
//     >
//       Select Card
//     </Slice>,
//     <Slice
//       key={"draw-one-faceup-slice"}
//       onSelect={() => {
//         if (props.selectedCardStacks.length === 1) {
//           props.drawCardsOutOfCardStack({
//             cardStackId: props.selectedCardStacks[0].id,
//             numberToDraw: 1,
//             facedown: false,
//           });
//         }
//       }}
//     >
//       1 faceup
//     </Slice>,
//     <Slice
//       key={"draw-one-facedown-slice"}
//       onSelect={() => {
//         if (props.selectedCardStacks.length === 1) {
//           props.drawCardsOutOfCardStack({
//             cardStackId: props.selectedCardStacks[0].id,
//             numberToDraw: 1,
//             facedown: true,
//           });
//         }
//       }}
//     >
//       1 facedown
//     </Slice>,
//     <Slice
//       key={"draw-x-faceup-slice"}
//       onSelect={() => {
//         setCurrentDrawMode(DrawMode.FaceUp);
//         setVisibleMenu(MenuType.DrawNumber);
//       }}
//     >
//       X faceup
//     </Slice>,
//     <Slice
//       key={"draw-x-facedown-slice"}
//       onSelect={() => {
//         setCurrentDrawMode(DrawMode.FaceDown);
//         setVisibleMenu(MenuType.DrawNumber);
//       }}
//     >
//       X facedown
//     </Slice>,
//   ];
// };

// const renderDrawNumberMenu = (props: IProps, currentDrawMode: DrawMode) => {
//   return Array.from({ length: 10 }, (_, i) => i + 1).map((num) => {
//     return (
//       <Slice
//         key={`draw-${num}-cards-slice`}
//         onSelect={() => {
//           if (props.selectedCardStacks.length === 1) {
//             props.drawCardsOutOfCardStack({
//               cardStackId: props.selectedCardStacks[0].id,
//               numberToDraw: num,
//               facedown: currentDrawMode === DrawMode.FaceDown,
//             });
//           }
//         }}
//       >
//         {num}
//       </Slice>
//     );
//   });
// };

// const renderModifierMenu = (
//   props: IProps,
//   setVisibleMenu: (type: MenuType) => void,
//   setCurrentModifier: (mod: string) => void
// ) => {
//   if (!props.currentGameType) return null;
//   return GamePropertiesMap[props.currentGameType].modifiers.map((m) => {
//     return (
//       <Slice
//         key={"modifier-slice"}
//         onSelect={() => {
//           setCurrentModifier(m.attributeId);
//           setVisibleMenu(MenuType.ModifierNumber);
//         }}
//       >
//         {m.attributeName}
//       </Slice>
//     );
//   });
// };

// const renderModifierNumberMenu = (props: IProps, currentModifier: string) => {
//   const basicNums = [
//     <Slice
//       key={`modifier-plus-one-slice`}
//       onSelect={() => {
//         props.adjustModifier({ modifierId: currentModifier, delta: 1 });
//       }}
//     >
//       Add 1
//     </Slice>,
//     <Slice
//       key={`modifier-minus-one-slice`}
//       onSelect={() => {
//         props.adjustModifier({ modifierId: currentModifier, delta: -1 });
//       }}
//     >
//       Remove 1
//     </Slice>,
//     <Slice
//       key={`modifier-zero-slice`}
//       onSelect={() => {
//         props.adjustModifier({ modifierId: currentModifier, value: 0 });
//       }}
//     >
//       0
//     </Slice>,
//   ];

//   const allNums = basicNums
//     .concat(
//       Array.from({ length: 3 }, (_, i) => i + 1).map((num) => {
//         return (
//           <Slice
//             key={`modifier-pos-${num}-cards-slice`}
//             onSelect={() => {
//               props.adjustModifier({ modifierId: currentModifier, value: num });
//             }}
//           >
//             {num}
//           </Slice>
//         );
//       })
//     )
//     .concat(
//       Array.from({ length: 3 }, (_, i) => i + 1).map((num) => {
//         return (
//           <Slice
//             key={`modifier-neg-${num}-cards-slice`}
//             onSelect={() => {
//               props.adjustModifier({
//                 modifierId: currentModifier,
//                 value: num * -1,
//               });
//             }}
//           >
//             {num * -1}
//           </Slice>
//         );
//       })
//     );

//   return allNums;
// };

export default PlanetMenu;
