import React, { Component } from 'react';
import './App.css';
import { Card } from './Card';
import styled from 'styled-components';
import { SelectableGroup } from 'react-selectable';

const cardBase = {
  selected: false,
  wasDragged: false,
  dragging: false,
  exhausted: false,
  rotating: false,
  x: 0,
  y: 0,
  startPosition: {
    x: 0,
    y: 0,
  }
}

const SLOPPY_THRESHOLD = 0; // pixels

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

  constructor(props) {
    super(props);
    this.state = {
      selectionEnabled: true,
      cards: [
        { 
          ...cardBase,
          id: 1,
          x: 0,
          y: 0,
        },
        { 
          ...cardBase,
          id: 2,
          x: 200,
          y: 0,
        },
        { 
          ...cardBase,
          id: 3,
          x: 400,
          y: 0,
        },
        { 
          ...cardBase,
          id: 4,
          x: 600,
          y: 0,
        },

        { 
          ...cardBase,
          id: 5,
          x: 0,
          y: 300,
        },
        { 
          ...cardBase,
          id: 6,
          x: 200,
          y: 300,
        },
        { 
          ...cardBase,
          id: 7,
          x: 400,
          y: 300,
        },
        { 
          ...cardBase,
          id: 8,
          x: 600,
          y: 300,
        },
      ]
    };
  }

  handleStart = (id, draggableData) => {
    this.dragStartPos = {
      x: draggableData.x,
      y: draggableData.y,
    };

    // this.objectStartPosition = {
    //   x: this.state.cards.find((card) => card.id === id).x,
    //   y: this.state.cards.find((card) => card.id === id).y,
    // };

    this.setState(prevState => {
      return {
        cards: prevState.cards.map(card => {
          return (card.id === id || card.selected) ? 
          {
            ...card,
            wasDragged: false,
            dragging: false,
            startPosition: {
              x: card.x,
              y: card.y
            }
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
            x: card.wasDragged ? card.x : card.startPosition.x,
            y: card.wasDragged ? card.y : card.startPosition.y,
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
  }

  onClick = data => {
    if (this.state.cards.find(card => card.selected)) {
      this.setState(prevState => {
        return {
          cards: prevState.cards.map(card => {
            return {
              ...card,
              selected: false,
            };
          })
        };
      })
    }
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
        objectStartPosition={card.startPosition}>
      </Card>
    );

    return (
      <SelectableGroup 
        fixedPosition={true}
        onSelection={this.handleSelection}>
        <BoardDiv
          onClick={this.onClick}> 
            {cards}
        </BoardDiv>
      </SelectableGroup>
    );
  }
}

export default App;
