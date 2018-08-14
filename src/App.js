import React, { Component } from 'react';
import './App.css';
import { Stage, Layer, Rect } from 'react-konva';

class App extends Component {

  constructor(props) {
    super(props);
  }  

  render() {
    return (
      <Stage width={window.innerWidth} height= {window.innerHeight}>
        <Layer>
          <Rect
            x={50}
            y={50}
            width={100}
            height={100}
            fill='red'
            shadowBlur={10}
          />
        </Layer>
      </Stage>
    );
  }
    
}

export default App;
