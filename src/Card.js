import React, { PureComponent } from 'react';
import { Spring, animated } from 'react-spring/dist/konva';

class Card extends PureComponent {
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
                onDragStart={this.props.handleDragStart}
                onDragMove={this.props.handleDragMove}
                onDragEnd={this.props.handleDragEnd}
                onDblClick={this.props.handleDoubleClick}
                onDblTap={this.props.handleDoubleClick} 
                onClick={this.props.handleClick}/>
            )}
          </Spring>
        );
    }
};

export default Card;