// tslint:disable:no-console
import * as React from 'react';
import { Component } from 'react';
import { animated, Spring } from 'react-spring/renderprops-konva';
import { cardConstants } from 'src/constants/card-constants';

interface IProps {
  dragging: boolean,
  exhausted: boolean,
  fill: string,
  handleClick?: (id: number) => void,
  handleDoubleClick?: (id: number) => void,
  handleDragStart?: (id: number) => void,
  handleDragMove?: (id: number, dx: number, dy: number) => void,
  handleDragEnd?: (id: number) => void,
  id: number,
  selected: boolean,
  x: number,
  y: number,
  imgUrl: string,
  isGhost?: boolean,
}

interface IState {
  imageLoaded: boolean;
  prevImgUrl: string;
}

class Card extends Component<IProps, IState> {

  // tslint:disable-next-line:member-access
  static getDerivedStateFromProps(props: IProps, state: IState): IState | null {
    // Store prevImgUrl in state so we can compare when props change.
    // Clear out previously-loaded data (so we don't render stale stuff).
    if (props.imgUrl !== state.prevImgUrl) {
      return {
        imageLoaded: false,
        prevImgUrl: props.imgUrl,
      };
    }

    // No state update necessary
    return null;
  }

  private img: HTMLImageElement = new Image();

  constructor(props: IProps) {
    super(props)
    this.state = {
      imageLoaded: false,
      prevImgUrl: '',
    }

    // When the image loads, set a flag in the state
    this.img.onload = () => {
      this.setState({
        imageLoaded: true,
      });
    };
  }

  public componentDidUpdate(prevProps: IProps, prevState: IState) {
    if (!this.state.imageLoaded && this.props.imgUrl) {
      this.img.src = this.props.imgUrl;
    }
  }

  public render() {

    // this.img = new Image();
    // this.img.src = this.props.imgUrl;
    return (
      this.state.imageLoaded ? 
      <Spring
        native={true}
        to={{
            rotation: this.props.exhausted ? 90 : 0
        }}>
        {(animatedProps: any) => (
            <animated.Rect
            {...animatedProps}
            cornerRadius={9}
            x={this.props.x}
            y={this.props.y}
            width={cardConstants.CARD_WIDTH}
            height={cardConstants.CARD_HEIGHT}
            offset={{
                x: cardConstants.CARD_WIDTH / 2,
                y: cardConstants.CARD_HEIGHT / 2,
            }}
            stroke={this.props.selected ? 'blue' : ''}
            strokeWidth= {this.props.selected ? 8 : 0}
            fillPatternImage={this.img}
            fillPatternScaleX={cardConstants.CARD_WIDTH / this.img.naturalWidth}
            fillPatternScaleY={cardConstants.CARD_HEIGHT / this.img.naturalHeight}
            shadowBlur={this.props.dragging ? 10 : 0}
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
            />
        )}
      </Spring> : null
    );
  }

  private handleDoubleClick = () => {
    if(this.props.handleDoubleClick) {
      this.props.handleDoubleClick(this.props.id);
    }
  }

  private handleDragStart = (event: any) => {
    if(this.props.handleDragStart) {
      this.props.handleDragStart(this.props.id);
    }
  }

  private handleDragMove = (event: any) => {
    if(this.props.handleDragMove) {
      this.props.handleDragMove(
          this.props.id,
          event.target.x() - this.props.x,
          event.target.y() - this.props.y);
    }
  }

  private handleDragEnd = () => {
    if (this.props.handleDragEnd && this.props.dragging) {
      this.props.handleDragEnd(this.props.id);
    }
  }

  private handleClick = (event: any) => {
    if(this.props.handleClick) {
      this.props.handleClick(this.props.id);
      event.cancelBubble = true;
    }
  }

  private handleMouseDown = (event: any) => {
      event.cancelBubble = true;
  }
};

export default Card;