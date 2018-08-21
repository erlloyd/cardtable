import React, { Component } from 'react';
import './App.css';
import { Stage, Layer } from 'react-konva';
import Card from './Card';

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
    this.setState((prevState) => {
      return {
        ...prevState,
        exhausted: !prevState.exhausted
      }
    })
  }

  handleClick = (event) => {
    this.setState((prevState) => {
      return {
        ...prevState,
        selected: true
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
          <Card
            x={this.state.x}
            y={this.state.y}
            exhausted={this.state.exhausted}
            fill={this.state.fill}
            dragging={this.state.dragging}
            handleDragStart={this.handleDragStart}
            handleDragMove={this.handleDragMove}
            handleDragEnd={this.handleDragEnd}
            handleDoubleClick={this.handleDoubleClick}
            handleClick={this.handleClick}
          />
        </Layer>
      </Stage>
    );
  }
    
}

export default App;