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
const reactPieMenu = require("react-pie-menu");
const PieMenu = reactPieMenu.default;
const { Slice } = reactPieMenu;

enum MenuType {
  TopLevelActions = "toplevelactions",
  StatusTokenActions = "statustokenactions",
  CounterTokenActions = "countertokenactions",
  DrawActions = "drawactions",
  DrawNumber = "drawnumber",
}

enum DrawMode {
  FaceUp = "faceup",
  FaceDown = "facedown",
}

interface IProps {
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
}
const RadialMenu = (props: IProps) => {
  const [visibleMenu, setVisibleMenu] = useState(MenuType.TopLevelActions);
  const [currentDrawMode, setCurrentDrawMode] = useState(DrawMode.FaceDown);

  if (!props.position && visibleMenu !== MenuType.TopLevelActions) {
    setVisibleMenu(MenuType.TopLevelActions);
  }

  return !!props.position ? (
    <TopLayer
      trasparentBackground={true}
      offsetContent={false}
      position={{
        x: Math.max(props.position.x - 128, 0),
        y: Math.max(props.position.y - 128, 0),
      }}
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
        <PieMenu radius="156px" centerRadius="30px">
          {renderMenuSlices(
            visibleMenu,
            setVisibleMenu,
            currentDrawMode,
            setCurrentDrawMode,
            props
          )}
        </PieMenu>
      </div>
    </TopLayer>
  ) : null;
};

const renderMenuSlices = (
  visibleMenu: MenuType,
  setVisibleMenu: (type: MenuType) => void,
  currentDrawMode: DrawMode,
  setCurrentDrawMode: (mode: DrawMode) => void,
  props: IProps
) => {
  switch (visibleMenu) {
    case MenuType.StatusTokenActions:
      return renderStatusTokensMenu(props);
    case MenuType.CounterTokenActions:
      return renderCounterTokensMenu(props);
    case MenuType.DrawActions:
      return renderDrawMenu(props, setVisibleMenu, setCurrentDrawMode);
    case MenuType.DrawNumber:
      return renderDrawNumberMenu(props, currentDrawMode);
    case MenuType.TopLevelActions:
    default:
      return renderTopLevelMenu(props, setVisibleMenu);
  }
};

const renderTopLevelMenu = (
  props: IProps,
  setVisibleMenu: (type: MenuType) => void
) => {
  return [
    <Slice
      key={"flip-slice"}
      onSelect={() => {
        props.flipCards();
      }}
    >
      <div>
        {/* <FlipIcon /> */}
        <div>Flip</div>
      </div>
    </Slice>,
    <Slice
      key={"exhaust-slice"}
      onSelect={() => {
        props.exhaustCard();
      }}
    >
      <div>
        {/* <AutorenewIcon /> */}
        <div>Exhaust</div>
      </div>
    </Slice>,
    <Slice
      key={"shuffle-slice"}
      onSelect={() => {
        props.shuffleStack();
      }}
    >
      <div>
        {/* <ShuffleIcon /> */}
        <div>Shuffle</div>
      </div>
    </Slice>,
    <Slice
      key={"statuses-slice"}
      onSelect={() => {
        setVisibleMenu(MenuType.StatusTokenActions);
      }}
    >
      <div>Statuses</div>
    </Slice>,
    <Slice
      key={"tokens-slice"}
      onSelect={() => {
        setVisibleMenu(MenuType.CounterTokenActions);
      }}
    >
      <div>Tokens</div>
    </Slice>,
    <Slice
      key={"clear-slice"}
      onSelect={() => {
        props.clearCardTokens();
      }}
    >
      <div>Clear</div>
    </Slice>,
    <Slice
      key={"draw-menu-slice"}
      onSelect={() => {
        setVisibleMenu(MenuType.DrawActions);
      }}
    >
      <div>Draw</div>
    </Slice>,
  ];
};

const renderStatusTokensMenu = (props: IProps) => {
  if (!props.currentGameType) {
    return [<Slice></Slice>, <Slice></Slice>, <Slice></Slice>];
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
        });
      };

      let key = `touch-menu-slice-${tokenInfo.menuText
        .replace(/\s/g, "")
        .toLocaleLowerCase()}`;

      // key =
      //   key + (tokenInfo.touchMenuLetter?.indexOf("+") !== -1 ? "-plus" : "");
      return (
        <Slice key={key} onSelect={action}>
          <div>
            {!!tokenInfo.touchMenuIcon ? tokenInfo.touchMenuIcon : null}
            <div>{tokenInfo.menuText}</div>
          </div>
        </Slice>
      );
    });

  while (slices.length < 3) {
    slices = slices.concat([
      <Slice key={`extra-slice-${Math.random()}`}></Slice>,
    ]);
  }

  return slices;
};

const renderCounterTokensMenu = (props: IProps) => {
  if (!props.currentGameType) {
    return [<Slice></Slice>, <Slice></Slice>, <Slice></Slice>];
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
        <Slice key={key} onSelect={action}>
          <div>
            {!!tokenInfo.touchMenuIcon ? tokenInfo.touchMenuIcon : null}
            <div>{tokenInfo.touchMenuLetter}</div>
          </div>
        </Slice>
      );
    });

  while (slices.length < 3) {
    slices = slices.concat([
      <Slice key={`extra-slice-${Math.random()}`}></Slice>,
    ]);
  }

  return slices;
};

const renderDrawMenu = (
  props: IProps,
  setVisibleMenu: (type: MenuType) => void,
  setCurrentDrawMode: (mode: DrawMode) => void
) => {
  // if (!props.currentGameType) {
  return [
    <Slice
      key={"draw-one-faceup-slice"}
      onSelect={() => {
        if (props.selectedCardStacks.length === 1) {
          props.drawCardsOutOfCardStack({
            cardStackId: props.selectedCardStacks[0].id,
            numberToDraw: 1,
            facedown: false,
          });
        }
      }}
    >
      1 faceup
    </Slice>,
    <Slice
      key={"draw-one-facedown-slice"}
      onSelect={() => {
        if (props.selectedCardStacks.length === 1) {
          props.drawCardsOutOfCardStack({
            cardStackId: props.selectedCardStacks[0].id,
            numberToDraw: 1,
            facedown: true,
          });
        }
      }}
    >
      1 facedown
    </Slice>,
    <Slice
      key={"draw-x-faceup-slice"}
      onSelect={() => {
        setCurrentDrawMode(DrawMode.FaceUp);
        setVisibleMenu(MenuType.DrawNumber);
      }}
    >
      X faceup
    </Slice>,
    <Slice
      key={"draw-x-facedown-slice"}
      onSelect={() => {
        setCurrentDrawMode(DrawMode.FaceDown);
        setVisibleMenu(MenuType.DrawNumber);
      }}
    >
      X facedown
    </Slice>,
  ];
  // }
};

const renderDrawNumberMenu = (props: IProps, currentDrawMode: DrawMode) => {
  return Array.from({ length: 10 }, (_, i) => i + 1).map((num) => {
    return (
      <Slice
        key={`draw-${num}-cards-slice`}
        onSelect={() => {
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
      </Slice>
    );
  });
};

export default RadialMenu;
