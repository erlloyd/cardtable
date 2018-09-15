import React, { Component } from 'react';
import './App.css';
import { Stage, Layer, Rect } from 'react-konva';
import Card from './Card';
import * as Intersects from 'intersects';
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
    this.setState({
      selecting: true,
      selectStartPos: {
        x: event.evt.layerX,
        y: event.evt.layerY,
      }
    });
  }

  getSelectionRectInfo = () => {
    const selectStartPos = this.state.selectStartPos;
    const selectRect = this.state.selectRect;
    return {
      x: selectRect.width < 0 ? selectStartPos.x + selectRect.width : selectStartPos.x,
      y: selectRect.height < 0 ? selectStartPos.y + selectRect.height : selectStartPos.y,
      width: Math.abs(selectRect.width),
      height: Math.abs(selectRect.height),
    };
  }

  handleMouseUp = () => {
    //if we were selecting, check for intersection
    if (this.state.selecting) {
      const selectRect = this.getSelectionRectInfo();
      const selectedCards = this.props.cards.reduce( 
        (currSelectedCards, card) =>{
          const intersects = Intersects.boxBox(
            selectRect.x,
            selectRect.y,
            selectRect.width,
            selectRect.height,
            card.x - 50, 
            card.y - 75,
            100,
            150)

          if (intersects) {
            currSelectedCards.push(card);
          }

          return currSelectedCards;
        },[]);

      this.props.selectMultipleCards(selectedCards.map(card => card.id));
    }
    
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
            selected={card.selected}
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
        onClick={this.props.unselectAllCards}
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