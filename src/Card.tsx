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
}

interface IState {
  imageLoaded: boolean;
}

class Card extends Component<IProps, IState> {
  
  private img?: any;

  constructor(props: IProps) {
    super(props)
    this.state = {
      imageLoaded: false,
    }
  }

  public componentDidMount() {
    this.img = undefined;
    if (this.props.imgUrl) {
      this.img = new Image();
      this.img.onload = () => {
        this.setState({
          imageLoaded: true
        });
      };
      this.img.src = this.props.imgUrl;
    }
  }

  public render() {
    this.img = new Image();
    this.img.src = this.props.imgUrl;
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
            cornerRadius={7}
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
            fillPatternScaleX={0.5}
            fillPatternScaleY={0.5}
            shadowBlur={this.props.dragging ? 10 : 0}
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