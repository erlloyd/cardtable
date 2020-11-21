// tslint:disable:no-console
import { KonvaEventObject } from "konva/types/Node";
import * as React from "react";
import { Component } from "react";
import { animated, Spring } from "react-spring/renderprops-konva";
import { cardConstants } from "./constants/card-constants";
// import Portal from './Portal';
// import ContextMenu from './ContextMenu';

interface IProps {
  dragging: boolean;
  exhausted: boolean;
  fill: string;
  handleClick?: (id: string) => void;
  handleDoubleClick?: (id: string) => void;
  handleDragStart?: (id: string, event: MouseEvent) => void;
  handleDragMove?: (info: { id: string; dx: number; dy: number }) => void;
  handleDragEnd?: (id: string) => void;
  handleHover?: (id: string) => void;
  handleHoverLeave?: (id: string) => void;
  id: string;
  selected: boolean;
  dropTarget?: boolean;
  x: number;
  y: number;
  width?: number;
  height?: number;
  imgUrl: string;
  isGhost?: boolean;
  numCardsInStack?: number;
  handleContextMenu?: (
    id: string,
    event: KonvaEventObject<PointerEvent>
  ) => void;
}

interface IState {
  imageLoaded: boolean;
  prevImgUrl: string;
}

class Card extends Component<IProps, IState> {
  // tslint:disable-next-line:member-access
  static getDerivedStateFromProps(props: IProps, state: IState): IState | null {
    if (props.imgUrl !== state.prevImgUrl) {
      return {
        imageLoaded: false,
        prevImgUrl: props.imgUrl,
      };
    }
    // No state update necessary
    return null;
  }

  private img: HTMLImageElement;
  private unmounted: boolean;

  constructor(props: IProps) {
    super(props);

    this.unmounted = true;

    this.state = {
      imageLoaded: false,
      prevImgUrl: this.props.imgUrl,
    };

    this.img = new Image();

    // When the image loads, set a flag in the state
    this.img.onload = () => {
      if (!this.unmounted) {
        this.setState({
          imageLoaded: true,
        });
      }
    };

    if (props.imgUrl) {
      this.img.src = props.imgUrl;
    }
  }

  public componentDidUpdate(prevProps: IProps, prevState: IState) {
    if (
      !this.state.imageLoaded &&
      this.props.imgUrl &&
      this.props.imgUrl !== this.img.src
    ) {
      this.img.src = this.props.imgUrl;
    }
  }

  public componentDidMount() {
    this.unmounted = false;
  }

  public componentWillUnmount() {
    this.unmounted = true;
  }

  public render() {
    return this.state.imageLoaded ? this.renderCard() : null;
  }

  private renderContext() {
    // return this.state.showContextMenu ? (
    //   <Portal key={`${this.props.id}-context`}>
    //     <div>HI THERE</div>
    //   </Portal>
    // ) : null;
  }

  private renderCard() {
    const heightToUse = this.props.height || cardConstants.CARD_HEIGHT;
    const widthToUse = this.props.width || cardConstants.CARD_WIDTH;

    return (
      <Spring
        key={`${this.props.id}-card`}
        native={true}
        to={{
          rotation: this.props.exhausted ? 90 : 0,
        }}
      >
        {(animatedProps: any) => (
          <animated.Rect
            {...animatedProps}
            cornerRadius={9}
            x={this.props.x}
            y={this.props.y}
            width={widthToUse}
            height={heightToUse}
            offset={{
              x: widthToUse / 2,
              y: heightToUse / 2,
            }}
            stroke={this.props.dropTarget ? "blue" : ""}
            strokeWidth={this.props.dropTarget ? 2 : 0}
            fillPatternImage={this.img}
            fillPatternScaleX={
              this.state.imageLoaded
                ? widthToUse / this.img.naturalWidth
                : widthToUse
            }
            fillPatternScaleY={
              this.state.imageLoaded
                ? heightToUse / this.img.naturalHeight
                : heightToUse
            }
            shadowBlur={this.props.dragging ? 10 : this.props.selected ? 5 : 0}
            opacity={this.props.isGhost ? 0.5 : 1}
            draggable={true}
            onDragStart={this.handleDragStart}
            onDragMove={this.handleDragMove}
            onDragEnd={this.handleDragEnd}
            onDblClick={this.handleDoubleClick}
            onDblTap={this.handleDoubleClick}
            onClick={this.handleClick}
            onTap={this.handleClick}
            onMouseDown={this.handleMouseDown}
            onTouchStart={this.handleMouseDown}
            onMouseOver={this.handleMouseOver}
            onMouseOut={this.handleMouseOut}
            onContextMenu={this.handleContextMenu}
          />
        )}
      </Spring>
    );
  }

  private handleContextMenu = (event: KonvaEventObject<PointerEvent>): void => {
    if (!!this.props.handleContextMenu) {
      this.props.handleContextMenu(this.props.id, event);
    }
    // console.log('Context Menu in Card!');
    // event.evt.preventDefault();
    // event.cancelBubble = true;
    // if (!!this.props.numCardsInStack && this.props.numCardsInStack > 1) {
    //   console.log('Can shuffle!');
    // } else {
    //   console.log('Can\'t shuffle!');
    // }
  };

  private handleDoubleClick = () => {
    if (this.props.handleDoubleClick) {
      this.props.handleDoubleClick(this.props.id);
    }
  };

  private handleDragStart = (event: MouseEvent) => {
    if (this.props.handleDragStart) {
      this.props.handleDragStart(this.props.id, event);
    }
  };

  private handleDragMove = (event: any) => {
    if (this.props.handleDragMove) {
      this.props.handleDragMove({
        id: this.props.id,
        dx: event.target.x() - this.props.x,
        dy: event.target.y() - this.props.y,
      });
    }
  };

  private handleDragEnd = () => {
    if (this.props.handleDragEnd && this.props.dragging) {
      this.props.handleDragEnd(this.props.id);
    }
  };

  private handleClick = (event: any) => {
    if (this.props.handleClick) {
      this.props.handleClick(this.props.id);
      event.cancelBubble = true;
    }
  };

  private handleMouseDown = (event: any) => {
    event.cancelBubble = true;
  };

  private handleMouseOver = () => {
    if (this.props.handleHover) {
      this.props.handleHover(this.props.id);
    }
  };

  private handleMouseOut = () => {
    if (this.props.handleHoverLeave) {
      this.props.handleHoverLeave(this.props.id);
    }
  };
}

export default Card;
