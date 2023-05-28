import { Component } from "react";
import { Rect } from "react-konva";
import { Vector2d } from "konva/lib/types";
import { KonvaEventObject } from "konva/lib/Node";
import { GameType } from "./game-modules/GameType";

interface IProps {
  id: string;
  imgUrl: string;
  backImgUrl?: string;
  currentGameType: GameType;
  pos: Vector2d;
  faceup: boolean;
  updatePos: (payload: { id: string; pos: Vector2d }) => void;
  flipToken: (id: string) => void;
}

interface IState {
  img: HTMLImageElement | null;
  backImg: HTMLImageElement | null;
}

class FlippableToken extends Component<IProps, IState> {
  static whyDidYouRender = true;
  constructor(props: IProps) {
    super(props);

    this.state = {
      img: null,
      backImg: null,
    };
  }

  public componentDidMount() {
    const image = new Image();
    image.onload = () => {
      this.setState({
        img: image,
      });
    };
    image.src = this.props.imgUrl;

    if (!!this.props.backImgUrl) {
      const backImg = new Image();
      backImg.onload = () => {
        this.setState({
          backImg: backImg,
        });
      };
      backImg.src = this.props.backImgUrl;
    }
  }

  render() {
    const hasBackImage = !!this.props.backImgUrl;
    let imgToUse = this.state.img ?? undefined;

    if (!this.props.faceup && hasBackImage) {
      imgToUse = this.state.backImg ?? undefined;
    }

    return (
      <Rect
        onDblClick={() => {
          this.props.flipToken(this.props.id);
        }}
        onDblTap={() => {
          this.props.flipToken(this.props.id);
        }}
        x={this.props.pos.x}
        y={this.props.pos.y}
        draggable={true}
        onTouchStart={this.cancelBubble}
        onMouseDown={this.cancelBubble}
        onDragEnd={this.handleDragEnd}
        scale={{
          x: 100 / (imgToUse?.naturalWidth ?? 1),
          y: 100 / (imgToUse?.naturalWidth ?? 1),
        }}
        width={imgToUse?.naturalWidth ?? 0}
        height={imgToUse?.naturalHeight ?? 0}
        fillPatternImage={imgToUse}
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
      id: this.props.id,
      pos: {
        x: event.target.x(),
        y: event.target.y(),
      },
    });
  };
}

export default FlippableToken;
