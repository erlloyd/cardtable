import * as React from 'react';
import { PureComponent } from 'react';
import { animated, Spring } from 'react-spring/dist/konva';

interface IProps {
  dragging: boolean,
  exhausted: boolean,
  fill: string,
  handleClick: (id: number) => void,
  handleDoubleClick: (id: number) => void,
  handleDragStart: (id: number) => void,
  handleDragMove: (id: number, dx: number, dy: number) => void,
  handleDragEnd: (id: number) => void,
  id: number,
  selected: boolean,
  x: number,
  y: number
}

class Card extends PureComponent<IProps> {
  
  public render() {
    return (
      <Spring
        native={true}
        to={{
            rotation: this.props.exhausted ? 90 : 0
        }}>
        {(animatedProps: any) => (
            <animated.Rect
            {...animatedProps}
            x={this.props.x}
            y={this.props.y}
            width={100}
            height={150}
            offset={{
                x: 50,
                y: 75
            }}
            zIndex={this.props.dragging ? 100 : 1}
            fill={this.props.selected ? 'green' : this.props.fill}
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
            onTouchStart={this.handleMouseDown}/>
        )}
      </Spring>
    );
  }

  private handleDoubleClick = () => {
      this.props.handleDoubleClick(this.props.id);
  }

  private handleDragStart = (event: any) => {
      this.props.handleDragStart(this.props.id);
  }

  private handleDragMove = (event: any) => {
      this.props.handleDragMove(
          this.props.id,
          event.target.x() - this.props.x,
          event.target.y() - this.props.y);
  }

  private handleDragEnd = () => {
      this.props.handleDragEnd(this.props.id);
  }

  private handleClick = (event: any) => {
      this.props.handleClick(this.props.id);
      event.cancelBubble = true;
  }

  private handleMouseDown = (event: any) => {
      event.cancelBubble = true;
  }
};

export default Card;