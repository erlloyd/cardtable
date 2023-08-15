import { Vector2d } from "konva/lib/types";
import * as React from "react";
import "./TopLayer.scss";
import { SwipeableHandlers, useSwipeable } from "react-swipeable";

interface IProps {
  trasparentBackground?: boolean;
  offsetContent?: boolean;
  staticPosition?: boolean;
  position: Vector2d;
  completed: () => void;
  children?: React.ReactNode;
  onSwipeUp?: () => void;
}

const TopLayer = (props: IProps) => {
  let handlers = {} as SwipeableHandlers;
  if (props.onSwipeUp) {
    handlers = useSwipeable({
      onSwipedUp: () => {
        if (props.onSwipeUp) {
          props.onSwipeUp();
        }
      },
      preventScrollOnSwipe: true,
    });
  }

  const offset = props.offsetContent ? 8 : 0;
  const containerStyle: React.CSSProperties = props.staticPosition
    ? {
        position: "static",
      }
    : {
        top: `${props.position.y + offset}px`,
        left: `${props.position.x + offset}px`,
      };

  if (!props.trasparentBackground) {
    containerStyle.backgroundColor = "white";
  }

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    event.stopPropagation();
    props.completed();
  };

  const preventDefault = (event: any) => {
    event.preventDefault();
  };

  const stopProp = (event: any) => {
    event.stopPropagation();
  };

  return (
    <div
      id="top-layer"
      onClick={props.completed}
      onContextMenu={preventDefault}
      style={{ touchAction: "pan-y" }}
      {...handlers}
    >
      <div
        className={`top-layer-content-wrapper ${
          !props.children && "no-content"
        }`}
        style={containerStyle}
        onContextMenu={preventDefault}
        onClick={handleClick}
        onKeyDown={stopProp}
        onKeyPress={stopProp}
        onKeyUp={stopProp}
      >
        {props.children}
      </div>
    </div>
  );
};

export default TopLayer;
