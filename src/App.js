import React, { Component } from 'react';
import './App.css';
import { Stage, Layer, Rect } from 'react-konva';
import Konva from 'konva';

class App extends Component {

  rect;

  constructor(props) {
    super(props);

    this.state = {
      x: 200,
      y: 200,
      fill: 'red',
      exhausted: false,
    }

  }  

  handleDoubleClick = (event) => {
    this.rect.to({
      rotation: this.state.exhausted ? 0 : 90,
      duration: 0.2
    })
    this.setState((prevState) => {
      return {
        ...prevState,
        exhausted: !prevState.exhausted
      }
    })
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

  render() {
    return (
      <Stage 
        width={window.innerWidth}
        height={window.innerHeight}>
        <Layer>
          <Rect
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
          />
        </Layer>
      </Stage>
    );
  }
    
}

export default App;
