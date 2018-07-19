import React, { Component } from 'react';
import './App.css';
import { Card } from './Card';
import styled from 'styled-components';
import { SelectableGroup } from 'react-selectable';

const SLOPPY_THRESHOLD = 3; // pixels

const BoardDiv = styled.div`
display: flex;
position: relative;
width: 100%;
height: 1000px;

`;
class App extends Component {

  dragStartPos = {
    x: 0,
    y: 0,
  };

  objectStartPosition = {
    x: 0,
    y: 0,
  }

  constructor(props) {
    super(props);
    this.state = {
      selectionEnabled: true,
      cards: [
        { 
          id: 1,
          selected: false,
          wasDragged: false,
          dragging: false,
          exhausted: false,
          rotating: false,
          x: 0,
          y: 0 
        },
        {
          id: 2,
          selected: false,
          wasDragged: false,
          dragging: false,
          exhausted: false,
          rotating: false,
          x: 200,
          y: 0 
        },
      ]
    };
  }

  handleStart = (id, draggableData) => {
    this.dragStartPos = {
      x: draggableData.x,
      y: draggableData.y,
    };

    this.objectStartPosition = {
      x: this.state.cards.find((card) => card.id === id).x,
      y: this.state.cards.find((card) => card.id === id).y,
    };

    this.setState(prevState => {
      return {
        cards: prevState.cards.map(card => {
          return (card.id === id || card.selected) ? 
          {
            ...card,
            wasDragged: false,
            dragging: false,
          } 
          : card;
        })
      }
    });
  }

  handleDrag = (id, draggableData) => {
    let dragging = false;
    let wasDragged = false;
    if (
      draggableData.x - this.dragStartPos.x > SLOPPY_THRESHOLD ||
      draggableData.y - this.dragStartPos.y > SLOPPY_THRESHOLD ||
      this.dragStartPos.x - draggableData.x > SLOPPY_THRESHOLD ||
      this.dragStartPos.y - draggableData.y > SLOPPY_THRESHOLD
    ) {
      wasDragged = true;
      dragging = true;
    }

    this.setState(prevState => {
      return {
        cards: prevState.cards.map(card => {
          return (card.id === id || card.selected) ? 
          {
            ...card,
            wasDragged: card.wasDragged || wasDragged,
            dragging: card.dragging || dragging,
            x: card.x + draggableData.deltaX,
            y: card.y + draggableData.deltaY,
          } 
          : card;
        })
      }
    });
  }

  handleStop = (id) => {
    this.setState(prevState => {
      return {
        cards: prevState.cards.map(card => {
          return (card.id === id || card.selected) ? 
          {
            ...card,
            dragging: false,
            x: card.wasDragged ? card.x : this.objectStartPosition.x,
            y: card.wasDragged ? card.y : this.objectStartPosition.y,
          } 
          : card;
        })
      }
    });
  }

  cardMoveEnded = () => {
    this.setState({
      selectionEnabled: true
    })
  }

  handleSelection = selectedKeys => {
    console.log('handleSelection: ' + selectedKeys);
    this.setState(prevState => {
      return {
        cards: prevState.cards.map(card => {
          return selectedKeys.find(val => val === card.id) ?
          {
            ...card,
            selected: true,
          }
          :
          {
            ...card,
            selected: false,
          }
        })
      }
    });
    console.log(this.state);
  }

  startExhaustCard = id => {
    console.log('starting exhausting card ' + id);
    this.setState(prevState => {
      return {
        cards: prevState.cards.map(card => {
          return card.id === id ? {...card, rotating: true, exhausted: (!card.exhausted)} : card;
        })
      }
    });
  }

  finishExhaustCard = id => {
    console.log('finishing exhausting card ' + id);
    this.setState(prevState => {
      return {
        cards: prevState.cards.map(card => {
          return card.id === id ? {...card, rotating: false} : card;
        })
      }
    });
  }

  render() {
    const cards = this.state.cards.map( 
      (card) => 
      <Card 
        key={card.id}
        selectableKey={card.id}
        id={card.id}
        exhausted={card.exhausted}
        rotating={card.rotating}
        selected={card.selected}
        onClick={this.startExhaustCard}
        onClickCompleted={this.finishExhaustCard}
        x={card.x}
        y={card.y}
        dragging={card.dragging}
        wasDragged={card.wasDragged}
        handleStart={this.handleStart}
        handleDrag={this.handleDrag}
        handleStop={this.handleStop}
        objectStartPosition={this.objectStartPosition}>
      </Card>
    );

    return (
      <SelectableGroup 
        fixedPosition={true}
        onSelection={this.handleSelection}>
        <BoardDiv> 
            {cards}
        </BoardDiv>
      </SelectableGroup>
    );
  }
}

export default App;
