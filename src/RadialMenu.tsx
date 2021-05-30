import { Vector2d } from "konva/lib/types";
import React from "react";
import TopLayer from "./TopLayer";
const reactPieMenu = require("react-pie-menu");
const PieMenu = reactPieMenu.default;
const { Slice } = reactPieMenu;

interface IProps {
  position: Vector2d | null;
  hideRadialMenu: () => void;
  flipCards: () => void;
  exhaustCard: (id?: string) => void;
}
const RadialMenu = (props: IProps) => {
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
      <PieMenu radius="128px" centerRadius="30px">
        <Slice
          onSelect={() => {
            props.flipCards();
          }}
        >
          Flip
        </Slice>
        <Slice
          onSelect={() => {
            props.exhaustCard();
          }}
        >
          Exhaust
        </Slice>
        <Slice>Test3</Slice>
      </PieMenu>
    </TopLayer>
  ) : null;
};

export default RadialMenu;
