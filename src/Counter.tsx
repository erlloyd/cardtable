import { Component } from "react";
import * as React from "react";
import { Vector2d } from "konva/types/types";
import { Group, Rect, Text } from "react-konva";
import { KonvaEventObject } from "konva/types/Node";
import { PlayerColor } from "./constants/app-constants";

interface IProps {
  id: string;
  pos: Vector2d;
  value: number;
  color: PlayerColor;
  updateCounterValueBy: (amount: number) => void;
  handleContextMenu: (event: KonvaEventObject<PointerEvent>) => void;
  onDragEnd: (event: KonvaEventObject<DragEvent>) => void;
}

class Counter extends Component<IProps> {
  private touchTimer: any = null;

  render() {
    return (
      <Group
        x={this.props.pos.x}
        y={this.props.pos.y}
        draggable={true}
        onClick={this.cancelBubble}
        onContextMenu={this.props.handleContextMenu}
        onDragEnd={this.props.onDragEnd}
        onTouchStart={this.handleTouchStart}
        onMouseDown={this.cancelBubble}
        onTouchMove={this.handleTouchMove}
        onTouchEnd={this.handleTouchEnd}
      >
        <Rect
          cornerRadius={30}
          width={200}
          height={100}
          fill={this.props.color}
        ></Rect>
        <Text
          width={200}
          height={100}
          fontSize={36}
          text={`${this.props.value}`}
          align={"center"}
          verticalAlign={"middle"}
        ></Text>
        <Text
          x={10}
          y={25}
          width={50}
          height={50}
          fontSize={36}
          text={`-`}
          align={"center"}
          verticalAlign={"middle"}
          onClick={this.handleDecrement}
          onTap={this.handleDecrement}
        ></Text>
        <Text
          x={140}
          y={25}
          width={50}
          height={50}
          fontSize={36}
          text={`+`}
          align={"center"}
          verticalAlign={"middle"}
          onClick={this.handleIncrement}
          onTap={this.handleIncrement}
        ></Text>
      </Group>
    );
  }

  private cancelBubble = (event: KonvaEventObject<MouseEvent>) => {
    event.cancelBubble = true;
  };

  private handleDecrement = () => {
    this.props.updateCounterValueBy(-1);
  };

  private handleIncrement = () => {
    this.props.updateCounterValueBy(1);
  };

  private handleTouchStart = (event: KonvaEventObject<TouchEvent>) => {
    event.cancelBubble = true;
    if (!!this.touchTimer) {
      clearTimeout(this.touchTimer);
      this.touchTimer = null;
    }

    this.touchTimer = setTimeout(() => {
      this.props.handleContextMenu(
        (event as unknown) as KonvaEventObject<PointerEvent>
      );
    }, 750);
  };

  private handleTouchMove = (event: KonvaEventObject<TouchEvent>) => {
    if (!!this.touchTimer) {
      clearTimeout(this.touchTimer);
      this.touchTimer = null;
    }
  };

  private handleTouchEnd = (event: KonvaEventObject<TouchEvent>) => {
    if (!!this.touchTimer) {
      clearTimeout(this.touchTimer);
      this.touchTimer = null;
    }
  };
}

export default Counter;
