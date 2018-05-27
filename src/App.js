import React, { Component } from 'react';
import './App.css';
import { Card } from './Card';

class App extends Component {

  constructor(props) {
    super(props);
    this.state = {
      cards: [
        { id: 1, exhausted: false, rotating: false },
      ]
    };
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
    const cards = this.state.cards.map( (card) => <Card key={card.id} id={card.id} exhausted={card.exhausted} rotating={card.rotating} onClick={this.startExhaustCard} onClickCompleted={this.finishExhaustCard}></Card> );
    return (
      <div> {cards} </div>
    );
  }
}

export default App;
