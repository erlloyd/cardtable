import { Component } from "react";
import * as React from "react";
import { ICardStack } from "./features/cards/initialState";
import { Rect } from "react-konva";
interface IProps {
  x?: number;
  y?: number;
  card?: ICardStack;
}

class CardTokens extends Component<IProps> {
  render() {
    console.log(this.props.card);
    return (
      <Rect
        x={this.props.x}
        y={this.props.y}
        width={10}
        height={10}
        fill="green"
      ></Rect>
    );
  }
}

export default CardTokens;
