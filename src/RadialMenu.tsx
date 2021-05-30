import { Vector2d } from "konva/lib/types";
import React, { useState } from "react";
import TopLayer from "./TopLayer";
import FlipIcon from "@material-ui/icons/Flip";
// import IconButton from "@material-ui/core/IconButton";
// import OpenWithIcon from "@material-ui/icons/OpenWith";
import AutorenewIcon from "@material-ui/icons/Autorenew";
import ShuffleIcon from "@material-ui/icons/Shuffle";
const reactPieMenu = require("react-pie-menu");
const PieMenu = reactPieMenu.default;
const { Slice } = reactPieMenu;

enum MenuType {
  TopLevelActions = "toplevelactions",
  StatusTokenActions = "statustokenactions",
  CounterTokenActions = "countertokenactions",
}

let swallowClick = false;

interface IProps {
  position: Vector2d | null;
  hideRadialMenu: () => void;
  flipCards: () => void;
  exhaustCard: (id?: string) => void;
  shuffleStack: (id?: string) => void;
}
const RadialMenu = (props: IProps) => {
  const [visibleMenu, setVisibleMenu] = useState(MenuType.TopLevelActions);

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
          if (swallowClick) {
            event.stopPropagation();
            event.preventDefault();
            swallowClick = false;
          }
        }}
      >
        <PieMenu radius="128px" centerRadius="30px">
          {renderMenuSlices(visibleMenu, setVisibleMenu, props)}
        </PieMenu>
      </div>
    </TopLayer>
  ) : null;
};

const renderMenuSlices = (
  visibleMenu: MenuType,
  setVisibleMenu: (type: MenuType) => void,
  props: IProps
) => {
  switch (visibleMenu) {
    case MenuType.StatusTokenActions:
      return renderStatusTokensMenu(props);
    case MenuType.CounterTokenActions:
      return renderCounterTokensMenu(props);
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
      <FlipIcon fontSize="large" />
      <div>Flip</div>
    </Slice>,
    <Slice
      key={"exhaust-slice"}
      onSelect={() => {
        props.exhaustCard();
      }}
    >
      <AutorenewIcon fontSize="large" />
      <div>Exhaust</div>
    </Slice>,
    <Slice
      key={"shuffle-slice"}
      onSelect={() => {
        props.shuffleStack();
      }}
    >
      <ShuffleIcon fontSize="large" />
      <div>Shuffle</div>
    </Slice>,
    <Slice
      key={"statuses-slice"}
      onSelect={() => {
        setVisibleMenu(MenuType.StatusTokenActions);
        swallowClick = true;
      }}
    >
      <div>Statuses</div>
    </Slice>,
  ];
};

const renderStatusTokensMenu = (props: IProps) => {
  return [<Slice></Slice>, <Slice></Slice>, <Slice></Slice>];
};

const renderCounterTokensMenu = (props: IProps) => {};

export default RadialMenu;
