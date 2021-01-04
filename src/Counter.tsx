import { Component } from "react";
import * as React from "react";
import { Vector2d } from "konva/types/types";
import { Group, Rect, Text } from "react-konva";

interface IProps {
  id: string;
  pos: Vector2d;
  value: number;
  updateCounterValueBy: (amount: number) => void;
}

class Counter extends Component<IProps> {
  render() {
    return (
      <Group draggable={true}>
        <Rect
          cornerRadius={30}
          x={this.props.pos.x}
          y={this.props.pos.y}
          width={200}
          height={100}
          fill={"red"}
        ></Rect>
        <Text
          x={this.props.pos.x}
          y={this.props.pos.y}
          width={200}
          height={100}
          fontSize={36}
          text={`${this.props.value}`}
          align={"center"}
          verticalAlign={"middle"}
        ></Text>
        <Text
          x={this.props.pos.x + 10}
          y={this.props.pos.y + 25}
          width={50}
          height={50}
          fontSize={36}
          text={`-`}
          align={"center"}
          verticalAlign={"middle"}
          onClick={this.handleDecrement}
        ></Text>
        <Text
          x={this.props.pos.x + 140}
          y={this.props.pos.y + 25}
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
