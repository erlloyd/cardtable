import React, { Component } from 'react';
import './App.css';
import { Card } from './Card';
import styled from 'styled-components';
import { SelectableGroup, createSelectable } from 'react-selectable';

// const SelectableCard  = createSelectable(Card);

const BoardDiv = styled.div`
display: flex;
position: relative;
width: 100%;
height: 1000px;

`;

class App extends Component {

  constructor(props) {
    super(props);
    this.state = {
      selectionEnabled: true,
      cards: [
        { id: 1, exhausted: false, rotating: false },
        { id: 2, exhausted: false, rotating: false },
      ]
    };
  }

  cardMoveStarted = () => {
    this.setState({
      selectionEnabled: false
    })
  }

  cardMoveEnded = () => {
    this.setState({
      selectionEnabled: true
    })
  }

  handleSelection = selectedKeys => {
    console.log('handleSelection: ' + selectedKeys);
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
        onClick={this.startExhaustCard}
        onClickCompleted={this.finishExhaustCard}
        initialOffsetX={(card.id - 1) * 200}>
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
