import { Component } from "react";
import { Image as KonvaImage, Rect } from "react-konva";
import { Vector2d } from "konva/lib/types";
import { KonvaEventObject } from "konva/lib/Node";
import { GameType } from "./game-modules/GameType";
import { myPeerRef, PlayerColor } from "./constants/app-constants";
import Konva from "konva";

interface IProps {
  id: string;
  imgUrl: string;
  backImgUrl?: string;
  currentGameType: GameType;
  pos: Vector2d;
  faceup: boolean;
  controlledBy: string | null;
  selectedColor: PlayerColor;
  updatePos: (payload: { id: string; pos: Vector2d }) => void;
  flipToken: (id: string) => void;
  handleTokenSelect: (id: string, forceSelected?: boolean) => void;
}

interface IState {
  img: HTMLImageElement | null;
  backImg: HTMLImageElement | null;
}

class FlippableToken extends Component<IProps, IState> {
  static whyDidYouRender = false;
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
      <KonvaImage
        onClick={this.handleClick}
        onTap={this.handleClick}
        onDblClick={this.handleDblClick}
        onDblTap={this.handleDblClick}
        x={this.props.pos.x}
        y={this.props.pos.y}
        draggable={true}
        onTouchStart={this.cancelBubble}
        onMouseDown={this.cancelBubble}
        onDragStart={this.handleDragStart}
        onDragEnd={this.handleDragEnd}
        scale={{
          x: 100 / (imgToUse?.naturalWidth ?? 1),
          y: 100 / (imgToUse?.naturalWidth ?? 1),
        }}
        width={imgToUse?.naturalWidth ?? 0}
        height={imgToUse?.naturalHeight ?? 0}
        image={imgToUse}
        strokeWidth={this.props.controlledBy ? 5 : 0}
        stroke={this.props.selectedColor}
      ></KonvaImage>
    );
  }

  private cancelBubble = (
    e: KonvaEventObject<MouseEvent> | KonvaEventObject<TouchEvent>
  ) => {
    e.cancelBubble = true;
  };

  private handleDragStart = () => {
    this.props.handleTokenSelect(this.props.id, true);
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

  private handleClick = (evt: Konva.KonvaEventObject<MouseEvent>) => {
    this.props.handleTokenSelect(this.props.id);
    evt.cancelBubble = true;
  };

  private handleDblClick = (evt: Konva.KonvaEventObject<MouseEvent>) => {
    this.props.handleTokenSelect(this.props.id, true);
    this.props.flipToken(this.props.id);
    evt.cancelBubble = true;
  };
}

export default FlippableToken;
