import * as Intersects from 'intersects';
import { Component } from 'react';
import * as React from 'react';
import { Layer, Rect, Stage } from 'react-konva';
import { cardConstants } from 'src/constants/card-constants';
import './App.css';
import Card from './Card';
import { CardData } from './external-api/beorn-json-data';
import { ICard, ICardsState } from './features/cards/initialState';

interface IProps {
  cards: ICardsState;
  cardsData: CardData[]
  cardMove: (id: number, dx: number, dy: number) => void;
  endCardMove: (id: number) => void;
  exhaustCard: (id: number) => void;
  selectCard: (id: number) => void;
  startCardMove: (id: number) => void;
  unselectAllCards: () => void;
  selectMultipleCards: (cardIds: number[]) => void;
  loadData: any;
}

interface IState {
  drewASelectionRect: boolean;
  selectRect: {
    height: number;
    width: number;
  },
  selectStartPos: {
    x: number;
    y: number;
  },
  selecting: boolean;
}
class App extends Component<IProps, IState> {

  constructor(props: IProps) {
    super(props)
    this.state = {
      drewASelectionRect: false,
      selectRect: {
        height: 0,
        width: 0,
      },
      selectStartPos: {
        x: 0,
        y: 0,
      },
      selecting: false,
    }
  }

  public componentDidMount() {
    this.props.loadData();
  }

  public render() {
    
    const staticCards = this.props.cards.cards
    .filter(card => !card.dragging)
    .map(
      card => {
        return (
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
            imgUrl={this.props.cardsData.length > 0 ? this.props.cardsData[card.id].Front.ImagePath : 'poop'}
          />
      )}
    );

    const ghostCards = this.props.cards.ghostCards
    .map(
      card => {
        return (
          <Card key={`ghost${card.id}`}
            id={card.id}
            x={card.x}
            y={card.y}
            exhausted={card.exhausted}
            fill={card.fill}
            selected={false}
            dragging={false}
            imgUrl={'https://ringsdb.com/bundles/cards/18001.png'}
            isGhost={true}
          />
        );
      }
    )

    const movingCards = this.props.cards.cards
    .filter(card => card.dragging)
    .map(
      card => {
        return (
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
            imgUrl={'https://ringsdb.com/bundles/cards/18001.png'}
          />
      )}
    );

    return (
      <Stage
        width={window.innerWidth}
        height={window.innerHeight}
        onClick={this.props.unselectAllCards}
        onTap={this.props.unselectAllCards}
        onMouseDown={this.handleMouseDown}
        onMouseUp={this.handleMouseUp}
        onMouseMove={this.handleMouseMove}
        onTouchMove={this.handleMouseMove}
        // // tslint:disable-next-line:jsx-no-lambda no-console
        // onDragStart={() => {console.log('STAGE onDragStart')}}
        // // tslint:disable-next-line:jsx-no-lambda no-console
        // onDragMove={() => {console.log('STAGE onDragMove')}}
        // // tslint:disable-next-line:jsx-no-lambda no-console
        // onDragEnd={() => {console.log('STAGE onDragEnd')}}
        preventDefault={true}>

        <Layer
          preventDefault={true}>
          {staticCards.concat(ghostCards).concat(movingCards)}
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

  private handleMouseDown = (event: any) => {

    this.setState({
      selectStartPos: {
        x: event.currentTarget.getPointerPosition().x,
        y: event.currentTarget.getPointerPosition().y,
      },
      selecting: true,
    });
  }

  private getSelectionRectInfo = () => {
    const selectStartPos = this.state.selectStartPos;
    const selectRect = this.state.selectRect;
    return {
      height: Math.abs(selectRect.height),
      width: Math.abs(selectRect.width),
      x: selectRect.width < 0 ? selectStartPos.x + selectRect.width : selectStartPos.x,
      y: selectRect.height < 0 ? selectStartPos.y + selectRect.height : selectStartPos.y,
    };
  }

  private handleMouseUp = () => {
    // if we were selecting, check for intersection
    if (this.state.drewASelectionRect) {
      const selectRect = this.getSelectionRectInfo();
      const selectedCards: any[] = this.props.cards.cards.reduce<ICard[]>( 
        (currSelectedCards, card) =>{
          const intersects = Intersects.boxBox(
            selectRect.x,
            selectRect.y,
            selectRect.width,
            selectRect.height,
            card.x - 50, 
            card.y - 75,
            cardConstants.CARD_WIDTH,
            cardConstants.CARD_HEIGHT)

          if (intersects) {
            currSelectedCards.push(card);
          }

          return currSelectedCards;
        },[]);

      this.props.selectMultipleCards(selectedCards.map(card => card.id));
    }
    
    this.setState({
      drewASelectionRect: false,
      selectRect: {
        height: 0,
        width: 0,
      },
      selectStartPos: {
        x: 0,
        y: 0
      },
      selecting: false,
    });
  }

  private handleMouseMove = (event: any) => {
    if (this.state.selecting) {
      this.setState({
        drewASelectionRect: true,
        selectRect: {
          height: event.currentTarget.getPointerPosition().y - this.state.selectStartPos.y,
          width: event.currentTarget.getPointerPosition().x - this.state.selectStartPos.x,
        },
      })
    }
    event.cancelBubble = true;
  }
}

export default App;