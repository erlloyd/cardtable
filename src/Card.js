import React, { PureComponent } from 'react';
import { Spring, animated } from 'react-spring/dist/konva';

class Card extends PureComponent {
    
    handleDoubleClick = () => {
        this.props.handleDoubleClick(this.props.id);
    }

    handleDragStart = () => {
        this.props.handleDragStart(this.props.id);
    }

    handleDragMove = (event) => {
        this.props.handleDragMove(
            this.props.id,
            event.target.x(),
            event.target.y());
    }

    handleDragEnd = () => {
        this.props.handleDragEnd(this.props.id);
    }

    handleClick = () => {
        this.props.handleClick(this.props.id);
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
                fill={this.props.fill}
                shadowBlur={this.props.dragging ? 10 : 0}
                draggable
                onDragStart={this.handleDragStart}
                onDragMove={this.handleDragMove}
                onDragEnd={this.handleDragEnd}
                onDblClick={this.handleDoubleClick}
                onDblTap={this.handleDoubleClick}
                onClick={this.handleClick}
                onMouseDown={this.handleMouseDown}/>
            )}
          </Spring>
        );
    }
};

export default Card;