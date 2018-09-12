import React, { Component } from 'react';
import './App.css';
import { Stage, Layer, Rect } from 'react-konva';
import Card from './Card';

class App extends Component {

  constructor(props) {
    super(props)
    this.state = {
      selecting: false,
      selectStartPos: {
        x: 0,
        y: 0,
      },
      selectRect: {
        width: 0,
        height: 0,
      }
    }
  }

  handleMouseDown = (event) => {
    console.log(`${event.target.x()},${event.target.y()}`);
    this.setState({
      selecting: true,
      selectStartPos: {
        x: event.evt.layerX,
        y: event.evt.layerY,
      }
    });
  }

  handleMouseUp = () => {
    this.setState({
      selecting: false,
      selectStartPos: {
        x: 0,
        y: 0
      },
      selectRect: {
        width: 0,
        height: 0
      }
    });
  }

  handleMouseMove = (event) => {
    if (this.state.selecting) {
      console.log(`${event.evt.layerX},${event.evt.layerY}`);
      this.setState({
        selectRect: {
          width: event.evt.layerX - this.state.selectStartPos.x,
          height: event.evt.layerY - this.state.selectStartPos.y
        }
      })
    }
  }

  render() {
    const cards = this.props.cards.map(
      card => (
        <Card
            key={card.id}
            id={card.id}
            x={card.x}
            y={card.y}
            exhausted={card.exhausted}
            fill={card.fill}
            dragging={card.dragging}
            handleDragStart={this.props.startCardMove}
            handleDragMove={this.props.cardMove}
            handleDragEnd={this.props.endCardMove}
            handleDoubleClick={this.props.exhaustCard}
            handleClick={this.props.selectCard}
          />
      )
    )
    return (
      <Stage
        width={window.innerWidth}
        height={window.innerHeight}
        onMouseDown={this.handleMouseDown}
        onMouseUp={this.handleMouseUp}
        onMouseMove={this.handleMouseMove}
        onDragStart={() => {console.log('STAGE onDragStart')}}
        onDragMove={() => {console.log('STAGE onDragMove')}}
        onDragEnd={() => {console.log('STAGE onDragEnd')}}>

        <Layer>
          {cards}
        </Layer>
        <Layer>
          <Rect
            x={this.state.selectStartPos.x}
            y={this.state.selectStartPos.y}
            width={this.state.selectRect.width}
            height={this.state.selectRect.height}
            stroke="black"/>
        </Layer>
      </Stage>
    );
  }
    
}

export default App;