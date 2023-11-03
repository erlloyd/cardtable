import { Component } from "react";
import { Rect } from "react-konva";
import { Vector2d } from "konva/lib/types";
import { KonvaEventObject } from "konva/lib/Node";
import { GameType } from "./game-modules/GameType";

interface IProps {
  currentGameType: GameType;
  pos: Vector2d;
  updatePos: (newPos: Vector2d) => void;
}

interface IState {
  img: HTMLImageElement | null;
}

class FirstPlayerToken extends Component<IProps, IState> {
  static whyDidYouRender = false;
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
      "/images/table/first_player_token_" + this.props.currentGameType + ".png";
  }

  render() {
    return (
      <Rect
        x={this.props.pos.x}
        y={this.props.pos.y}
        draggable={true}
        onTouchStart={this.cancelBubble}
        onMouseDown={this.cancelBubble}
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

  private cancelBubble = (
    e: KonvaEventObject<MouseEvent> | KonvaEventObject<TouchEvent>
  ) => {
    e.cancelBubble = true;
  };

  private handleDragEnd = (event: KonvaEventObject<DragEvent>) => {
    this.props.updatePos({
      x: event.target.x(),
      y: event.target.y(),
    });
  };
}

export default FirstPlayerToken;
