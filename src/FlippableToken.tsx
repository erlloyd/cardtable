import { Component } from "react";
import { Image as KonvaImage, Rect } from "react-konva";
import { Vector2d } from "konva/lib/types";
import { KonvaEventObject } from "konva/lib/Node";
import { GameType } from "./game-modules/GameType";
import { myPeerRef, PlayerColor } from "./constants/app-constants";
import Konva from "konva";
import { debounce } from "lodash";
import { tokenConstants } from "./constants/card-constants";

interface IProps {
  id: string;
  imgUrl: string;
  backImgUrl?: string;
  currentGameType: GameType;
  pos: Vector2d;
  faceup: boolean;
  controlledBy: string | null;
  selectedColor: PlayerColor;
  handleTokenEndMove: (payload: { id: string; pos: Vector2d }) => void;
  flipToken: (id: string) => void;
  handleTokenSelect: (payload: {
    ids: string[];
    forceSelected?: boolean;
    forceMultiSelectMode?: boolean;
  }) => void;
  handleTokenMove: (payload: {
    id: string;
    abs_x: number;
    dx: number;
    abs_y: number;
    dy: number;
  }) => void;
}

interface IState {
  img: HTMLImageElement | null;
  backImg: HTMLImageElement | null;
}

const debouncedHandleMove = debounce((event: any, props: IProps) => {
  props.handleTokenMove({
    id: props.id,
    abs_x: event.target.x(),
    dx: event.target.x() - props.pos.x,
    abs_y: event.target.y(),
    dy: event.target.y() - props.pos.y,
  });
}, 5);

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
        onDragMove={this.handleDragMove}
        onDragEnd={this.handleDragEnd}
        scale={{
          x:
            tokenConstants.FLIPPABLE_TOKEN_WIDTH /
            (imgToUse?.naturalWidth ?? 1),
          y:
            tokenConstants.FLIPPABLE_TOKEN_HEIGHT /
            (imgToUse?.naturalHeight ?? 1),
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

  private handleDragMove = (e: any) => {
    debouncedHandleMove(e, this.props);
  };

  private handleDragStart = (evt: Konva.KonvaEventObject<DragEvent>) => {
    // first check if we already have this token selected
    const isTokenSelected = this.props.controlledBy === myPeerRef;

    this.props.handleTokenSelect({
      ids: [this.props.id],
      forceSelected: true,
      forceMultiSelectMode: isTokenSelected,
    });
  };

  private handleDragEnd = (event: KonvaEventObject<DragEvent>) => {
    this.props.handleTokenEndMove({
      id: this.props.id,
      pos: {
        x: event.target.x(),
        y: event.target.y(),
      },
    });
  };

  private handleClick = (evt: Konva.KonvaEventObject<MouseEvent>) => {
    // Here check if modifier held down
    const modifierKeyHeld =
      evt.evt.shiftKey || evt.evt.metaKey || evt.evt.ctrlKey;

    this.props.handleTokenSelect({
      ids: [this.props.id],
      forceMultiSelectMode: modifierKeyHeld,
    });
    evt.cancelBubble = true;
  };

  private handleDblClick = (evt: Konva.KonvaEventObject<MouseEvent>) => {
    // Here check if modifier held down
    const modifierKeyHeld =
      evt.evt.shiftKey || evt.evt.metaKey || evt.evt.ctrlKey;

    this.props.handleTokenSelect({
      ids: [this.props.id],
      forceSelected: true,
      forceMultiSelectMode: modifierKeyHeld,
    });
    this.props.flipToken(this.props.id);
    evt.cancelBubble = true;
  };
}

export default FlippableToken;
