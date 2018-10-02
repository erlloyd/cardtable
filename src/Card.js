import React, { PureComponent } from 'react';
import { Spring, animated } from 'react-spring/dist/konva';

class Card extends PureComponent {
    
    handleDoubleClick = () => {
        this.props.handleDoubleClick(this.props.id);
    }

    handleDragStart = (event) => {
        this.dragStart = {
            x: event.target.x(),
            y: event.target.y()
        }
        this.props.handleDragStart(this.props.id);
    }

    handleDragMove = (event) => {
        this.props.handleDragMove(
            this.props.id,
            event.target.x() - this.props.x,
            event.target.y() - this.props.y);
    }

    handleDragEnd = () => {
        this.props.handleDragEnd(this.props.id);
    }

    handleClick = (event) => {
        this.props.handleClick(this.props.id);
        event.cancelBubble = true;
    }

    handleMouseDown = (event) => {
        event.cancelBubble = true;
    }

    render() {
        return (
          <Spring
            native
            to={{
                rotation: this.props.exhausted ? 90 : 0
            }}>
            {animatedProps => (
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
                fill={this.props.selected ? 'blue' : this.props.fill}
                shadowBlur={this.props.dragging ? 10 : 0}
                draggable
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
};

export default Card;