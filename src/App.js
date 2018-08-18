import React, { Component } from 'react';
import './App.css';
import { Stage, Layer } from 'react-konva';
import { Spring, animated } from 'react-spring/dist/konva';

class App extends Component {

  rect;

  constructor(props) {
    super(props);

    this.state = {
      x: 200,
      y: 200,
      fill: 'red',
      exhausted: false,
      selected: false,
      dragging: false
    }

  }  

  handleDoubleClick = (event) => {
    console.log('double clicked')
    console.log(this.state);
    this.setState((prevState) => {
      return {
        ...prevState,
        exhausted: !prevState.exhausted
      }
    })
  }

  handleClick = (event) => {
    console.log('clicked')
    console.log(this.state)
    this.setState((prevState) => {
      return {
        ...prevState,
        selected: !prevState.selected
      }
    })
  }

  handleDragStart = () => {
    this.setState((prevState) => {
      return {
        ...prevState,
        dragging: true
      };
    });
  }

  handleDragMove = (event) => {
    this.setState((prevState) => {
      return {
        ...prevState,
        x: event.target.x(),
        y: event.target.y(),
      }
    });
  }

  handleDragEnd = () => {
    this.setState((prevState) => {
      return {
        ...prevState,
        dragging: false
      };
    });
  }

  render() {
    return (
      <Stage 
        width={window.innerWidth}
        height={window.innerHeight}>
        <Layer>
          <Spring
          native
          to={{
            rotation: this.state.exhausted ? 90 : 0
          }}>
          {props => (
            <animated.Rect 
              {...props}
              x={this.state.x}
              y={this.state.y}
              width={100}
              height={150}
              offset={{
                x: 50,
                y: 75
              }}
              fill={this.state.fill}
              shadowBlur={this.state.dragging ? 10 : 0}
              draggable
              onDragStart={this.handleDragStart}
              onDragMove={this.handleDragMove}
              onDragEnd={this.handleDragEnd}
              onDblClick={this.handleDoubleClick}
              onDblTap={this.handleDoubleClick} 
              onClick={this.handleClick}/>
          )}
        </Spring>
        </Layer>
      </Stage>
    );
  }
    
}

export default App;




/* <Rect
            ref={node => {
              this.rect = node;
            }}
            x={this.state.x}
            y={this.state.y}
            width={100}
            height={200}
            offset={{
              x: 50,
              y: 100
            }}
            rotation={this.state.exhausted ? 90 : 0}
            fill={this.state.fill}
            shadowBlur={10}
            draggable
            onDragMove={this.handleDragMove}
            onDragEnd={this.handleDragMove}
            onDblClick={this.handleDoubleClick}
            onDblTap={this.handleDoubleClick}
            onClick={this.handleClick}
            onTap={this.handleClick}
          /> */