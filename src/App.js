import React, { Component } from 'react';
import './App.css';
import { Stage, Layer } from 'react-konva';
import Card from './Card';

class App extends Component {

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
        height={window.innerHeight}>
        <Layer>
          {cards}
        </Layer>
      </Stage>
    );
  }
    
}

export default App;