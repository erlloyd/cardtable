import { KonvaEventObject } from "konva/lib/Node";
import { Vector2d } from "konva/lib/types";
import { debounce } from "lodash";
import { Component } from "react";
import { Rect } from "react-konva";
import { IPlayerBoard } from "./features/cards/initialState";

interface IProps {
  id: string;
  pos: Vector2d;
  board: IPlayerBoard;
  handleContextMenu: (event: KonvaEventObject<PointerEvent>) => void;
  onDragMove: (id: string, event: KonvaEventObject<DragEvent>) => void;
  onDragEnd: (id: string, event: KonvaEventObject<DragEvent>) => void;
}

interface IState {
  boardImageLoaded: boolean;
}

class PlayerBoard extends Component<IProps, IState> {
  static whyDidYouRender = false;
  private touchTimer: any = null;
  private unmounted: boolean;
  private img: HTMLImageElement;

  constructor(props: IProps) {
    super(props);

    this.unmounted = true;

    this.state = {
      boardImageLoaded: false,
    };

    this.img = new Image();

    this.img.onload = () => {
      if (!this.unmounted) {
        this.setState({
          boardImageLoaded: true,
        });
      }
    };

    if (!!this.props.board.image) {
      this.img.src = this.props.board.image;
    }
  }

  public componentDidUpdate(prevProps: IProps, prevState: IState) {
    if (
      !this.state.boardImageLoaded &&
      !prevProps.board.image &&
      !!this.props.board.image
    ) {
      this.img.src = this.props.board.image;
    }
  }

  public componentDidMount() {
    this.unmounted = false;
  }

  public componentWillUnmount() {
    this.unmounted = true;
  }

  render() {
    const scale =
      !!this.img.naturalWidth && !!this.img.naturalHeight
        ? {
            x: this.props.board.width / this.img.naturalWidth,
            y: this.props.board.height / this.img.naturalHeight,
          }
        : { x: 1, y: 1 };

    return this.state.boardImageLoaded ? (
      <Rect
        x={this.props.pos.x}
        y={this.props.pos.y}
        draggable={true}
        onClick={this.cancelBubble}
        onContextMenu={this.props.handleContextMenu}
        onDragMove={this.handleDragMove}
        onDragEnd={this.handleDragEnd}
        onTouchStart={this.handleTouchStart}
        onMouseDown={this.cancelBubble}
        onTouchMove={this.handleTouchMove}
        onTouchEnd={this.handleTouchEnd}
        scale={scale}
        fillPatternScaleX={1}
        fillPatternScaleY={1}
        width={this.img.naturalWidth}
        height={this.img.naturalHeight}
        fillPatternImage={this.img}
      />
    ) : null;
  }

  private cancelBubble = (event: KonvaEventObject<MouseEvent>) => {
    event.cancelBubble = true;
  };

  private handleTouchStart = (event: KonvaEventObject<TouchEvent>) => {
    event.cancelBubble = true;
    if (!!this.touchTimer) {
      clearTimeout(this.touchTimer);
      this.touchTimer = null;
    }

    this.touchTimer = setTimeout(() => {
      this.props.handleContextMenu(
        event as unknown as KonvaEventObject<PointerEvent>
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

  private handleDragMove = debounce((event: KonvaEventObject<DragEvent>) => {
    if (this.props.onDragMove) {
      this.props.onDragMove(this.props.id, event);
    }
  }, 5);

  private handleDragEnd = (event: KonvaEventObject<DragEvent>) => {
    if (!!this.props.onDragEnd) {
      this.props.onDragEnd(this.props.id, event);
    }
  };
}

export default PlayerBoard;
