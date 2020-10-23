import * as Intersects from 'intersects';
import { Component } from 'react';
import * as React from 'react';
import { Layer, Rect, Stage } from 'react-konva';
import { cardConstants } from './constants/card-constants';
import './App.css';
import Card from './Card';
import { CardData } from './external-api/marvel-card-data';
import { ICard, ICardsState } from './features/cards/initialState';

interface IProps {
  cards: ICardsState;
  cardsData: CardData[];
  showPreview: boolean;
  panMode: boolean;
  cardMove: (info: {id: number, dx: number, dy: number}) => void;
  endCardMove: (id: number) => void;
  exhaustCard: (id: number) => void;
  selectCard: (id: number) => void;
  startCardMove: (id: number) => void;
  unselectAllCards: () => void;
  selectMultipleCards: (cards: {ids: number[]}) => void;
  hoverCard: (id: number) => void;
  hoverLeaveCard: (id: number) => void;
  togglePanMode: () => void;
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
    // this.props.loadData();
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
            handleHover={this.props.hoverCard}
            handleHoverLeave={this.props.hoverLeaveCard}
            imgUrl={this.props.cardsData.length > 0 ? process.env.PUBLIC_URL + '/images/cards/18ae183c-de26-4369-8a41-424d58f01631.jpg'/*this.props.cardsData[card.id].Front.ImagePath*/  : ''}
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
            imgUrl={this.props.cardsData.length > 0 ? process.env.PUBLIC_URL + '/images/cards/18ae183c-de26-4369-8a41-424d58f01631.jpg'/*this.props.cardsData[card.id].Front.ImagePath*/  : ''}
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
            imgUrl={this.props.cardsData.length > 0 ? process.env.PUBLIC_URL + '/images/cards/18ae183c-de26-4369-8a41-424d58f01631.jpg'/*this.props.cardsData[card.id].Front.ImagePath*/  : ''}
          />
      )}
    );

    const previewCards = this.props.cards.cards
    .filter(card => !this.state.selecting && this.props.showPreview && !!this.props.cards.previewCard && (card.id === this.props.cards.previewCard.id))
    .map(
      card => {
        return (
        <Card
            key={`preview${card.id}`}
            id={card.id}
            x={window.innerWidth - (cardConstants.CARD_PREVIEW_WIDTH / 2)}
            y={cardConstants.CARD_PREVIEW_HEIGHT / 2}
            exhausted={false}
            fill={card.fill}
            selected={false}
            dragging={false}
            imgUrl={this.props.cardsData.length > 0 ? process.env.PUBLIC_URL + '/images/cards/18ae183c-de26-4369-8a41-424d58f01631.jpg'/*this.props.cardsData[card.id].Front.ImagePath*/  : ''}
            height={cardConstants.CARD_PREVIEW_HEIGHT}
            width={cardConstants.CARD_PREVIEW_WIDTH}
          />
      )}
    );

    return (
      <div tabIndex={1} onKeyPress={this.handleKeyPress}>
        <Stage
          width={window.innerWidth}
          height={window.innerHeight}
          onClick={this.props.unselectAllCards}
          onTap={this.props.unselectAllCards}
          onMouseDown={this.props.panMode ? () => {} : this.handleMouseDown}
          onMouseUp={this.props.panMode ? () => {} : this.handleMouseUp}
          onMouseMove={this.props.panMode ? () => {} : this.handleMouseMove}
          onTouchMove={this.props.panMode ? () => {} : this.handleMouseMove}
          draggable={this.props.panMode}
          // // tslint:disable-next-line:jsx-no-lambda no-console
          // onDragStart={() => {console.log('STAGE onDragStart')}}
          // // tslint:disable-next-line:jsx-no-lambda no-console
          // onDragMove={() => {console.log('STAGE onDragMove')}}
          // // tslint:disable-next-line:jsx-no-lambda no-console
          // onDragEnd={() => {console.log('STAGE onDragEnd')}}
          preventDefault={true}>

          <Layer
            preventDefault={true}>
            {staticCards.concat(ghostCards).concat(movingCards).concat(previewCards)}
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
      </div>
    );
  }

  private handleKeyPress = (event: any) => {
    const code = event.which || event.keyCode;
    if(code === 115) {
      this.props.togglePanMode();
    }
  }
 
  private getRelativePositionFromTarget= (target: any) => {
    const transform = target.getAbsoluteTransform().copy();
    transform.invert();
    let pos = target.getPointerPosition();
    return transform.point(pos);
  }

  private handleMouseDown = (event: any) => {

    const pos = this.getRelativePositionFromTarget(event.currentTarget);

    this.setState({
      selectStartPos: {
        x: pos.x,
        y: pos.y,
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

      this.props.selectMultipleCards({ ids: selectedCards.map(card => card.id) });
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
      const pos = this.getRelativePositionFromTarget(event.currentTarget);
      this.setState({
        drewASelectionRect: true,
        selectRect: {
          height: pos.y - this.state.selectStartPos.y,
          width: pos.x - this.state.selectStartPos.x,
        },
      })
    }
    event.cancelBubble = true;
  }
}

export default App;