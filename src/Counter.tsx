import { Component } from "react";
import * as React from "react";
import { Vector2d } from "konva/types/types";
import { Group, Rect, Text } from "react-konva";
import { KonvaEventObject } from "konva/types/Node";

interface IProps {
  id: string;
  pos: Vector2d;
  value: number;
  updateCounterValueBy: (amount: number) => void;
  handleContextMenu: (event: KonvaEventObject<PointerEvent>) => void;
  onDragEnd: (event: KonvaEventObject<DragEvent>) => void;
}

class Counter extends Component<IProps> {
  render() {
    return (
      <Group
        x={this.props.pos.x}
        y={this.props.pos.y}
        draggable={true}
        onContextMenu={this.props.handleContextMenu}
        onDragEnd={this.props.onDragEnd}
      >
        <Rect cornerRadius={30} width={200} height={100} fill={"red"}></Rect>
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
        ></Text>
      </Group>
    );
  }

  private handleDecrement = () => {
    this.props.updateCounterValueBy(-1);
  };

  private handleIncrement = () => {
    this.props.updateCounterValueBy(1);
  };
}

export default Counter;
