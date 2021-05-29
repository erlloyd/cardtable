import { Vector2d } from "konva/lib/types";
import React from "react";
import TopLayer from "./TopLayer";

interface IProps {
  position: Vector2d | null;
  hideRadialMenu: () => void;
}
const RadialMenu = (props: IProps) => {
  return !!props.position ? (
    <TopLayer
      trasparentBackground={true}
      offsetContent={false}
      position={props.position}
      completed={() => {
        props.hideRadialMenu();
      }}
    >
      <div className="radial-menu">RADIAL MENU HERE</div>
    </TopLayer>
  ) : null;
};

export default RadialMenu;
