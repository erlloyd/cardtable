import { Component } from "react";
import * as React from "react";
import { Rect } from "react-konva";
import { Vector2d } from "konva/types/types";
import { KonvaEventObject } from "konva/types/Node";
import { GameType } from "./constants/app-constants";

interface IProps {
  currentGameType: GameType;
  pos: Vector2d;
  updatePos: (newPos: Vector2d) => void;
}

interface IState {
  img: HTMLImageElement | null;
}

class FirstPlayerToken extends Component<IProps, IState> {
  constructor(props: IProps) {
    super(props);

    this.state = {
      img: null,
    };
  }

  public componentDidMount() {
    const image = new Image();
    image.onload = () => {
      this.setState({
        img: image,
      });
    };
    image.src =
      process.env.PUBLIC_URL +
      "/images/table/first_player_token_" +
      this.props.currentGameType +
      ".png";
  }

  render() {
    return (
      <Rect
        x={this.props.pos.x}
        y={this.props.pos.y}
        draggable={true}
        onDragEnd={this.handleDragEnd}
        scale={{
          x: 160 / (this.state.img?.naturalWidth ?? 1),
          y: 160 / (this.state.img?.naturalWidth ?? 1),
        }}
        width={this.state.img?.naturalWidth ?? 0}
        height={this.state.img?.naturalHeight ?? 0}
        fillPatternImage={this.state.img ?? undefined}
      ></Rect>
    );
  }

  private handleDragEnd = (event: KonvaEventObject<DragEvent>) => {
    this.props.updatePos({
      x: event.target.x(),
      y: event.target.y(),
    });
  };
}

export default FirstPlayerToken;
