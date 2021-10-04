import React, { Component } from "react";
import {
  DragDropContext,
  Draggable,
  DraggableStateSnapshot,
  DraggingStyle,
  Droppable,
  DropResult,
  NotDraggingStyle,
  ResponderProvided,
} from "react-beautiful-dnd";
import { GameType, myPeerRef } from "./constants/app-constants";
import { ICardData } from "./features/cards-data/initialState";
import {
  ICardDetails,
  ICardStack,
  IPlayerHand,
} from "./features/cards/initialState";
import "./PlayerHand.scss";
import { getImgUrls } from "./utilities/card-utils";

const grid = 8;

const getItemStyle = (
  snapshot: DraggableStateSnapshot,
  draggableStyle: any
): DraggingStyle | NotDraggingStyle | undefined => {
  return snapshot.dropAnimation &&
    snapshot.draggingOver === "droppable-while-dragging"
    ? { ...draggableStyle, visibility: "hidden" }
    : {
        // some basic styles to make the items look a bit nicer
        userSelect: "none",
        margin: `0 ${grid}px 0 0`,

        // change background colour if dragging
        // background: snapshot.isDragging ? "lightgreen" : "grey",

        // styles we need to apply on draggables
        ...draggableStyle,
      };
};

const getListStyle = (isDraggingOver: boolean) =>
  ({
    background: isDraggingOver ? "lightblue" : "lightgrey",
    display: "flex",
    alignItems: "flex-start",
    padding: grid,
    overflowX: "auto",
    overflowY: "hidden",
    position: "absolute",
    bottom: "0px",
    width: "100vw",
    height: "70px",
    zIndex: 99,
    boxSizing: "border-box",
  } as React.CSSProperties);

const getListStyle2 = (isDraggingOver: boolean, isDraggingAtAll: boolean) => {
  return {
    background: "rgb(0,0,0,0)",
    display: isDraggingAtAll ? "flex" : "none",
    padding: grid,
    overflow: "auto",
    position: "absolute",
    top: "0px",
    height: "",
    width: "100vw",
    boxSizing: "border-box",
    zIndex: 100,
  } as React.CSSProperties;
};

const makeFakeCardStackFromJsonId = (jsonId: string): ICardStack => {
  return {
    controlledBy: myPeerRef,
    dragging: false,
    shuffling: false,
    exhausted: false,
    faceup: true,
    fill: "anything",
    id: "fake-id",
    selected: false,
    x: 0,
    y: 0,
    cardStack: [{ jsonId }],
    statusTokens: {
      stunned: false,
      confused: false,
      tough: false,
    },
    counterTokens: {
      damage: 0,
      threat: 0,
      generic: 0,
    },
    modifiers: {},
  };
};

interface IProps {
  droppedOnTable: (id: string) => void;
  reorderPlayerHand: (payload: {
    playerNumber: number;
    sourceIndex: number;
    destinationIndex: number;
  }) => void;
  removeFromPlayerHand: (payload: {
    playerNumber: number;
    index: number;
  }) => void;
  setPreviewCardJsonId: (jsonId: string) => void;
  clearPreviewCardJsonId: () => void;
  playerHandData: IPlayerHand | null;
  playerCardData: ICardData;
  playerNumber: number;
  currentGameType: GameType | null;
}
interface IState {
  dragging: boolean;
  imgUrlToStatusMap: { [key: string]: ImageLoadingStatus };
}

enum ImageLoadingStatus {
  NotLoaded,
  Loading,
  LoadingFailed,
  Loaded,
}

class PlayerHand extends Component<IProps, IState> {
  constructor(props: IProps) {
    super(props);
    this.state = {
      dragging: false,
      imgUrlToStatusMap: {},
    };
    this.onDragEnd = this.onDragEnd.bind(this);
    this.onDragStart = this.onDragStart.bind(this);
  }

  onDragStart() {
    this.setState({ dragging: true });
  }

  onDragEnd(result: DropResult, provided: ResponderProvided) {
    // dropped outside the list
    if (!result.destination) {
      this.setState({ dragging: false });
      return;
    }

    if (result.destination?.droppableId !== result.source.droppableId) {
      this.props.removeFromPlayerHand({
        playerNumber: this.props.playerNumber,
        index: result.source.index,
      });
      const cardDroppedJson = (this.props.playerHandData?.cards ?? [])[
        result.source.index
      ];
      this.props.droppedOnTable(cardDroppedJson.jsonId);
    } else {
      this.props.reorderPlayerHand({
        playerNumber: this.props.playerNumber,
        sourceIndex: result.source.index,
        destinationIndex: result.destination.index,
      });
    }

    this.setState({
      dragging: false,
    });
  }

  // Normally you would want to split things out into separate components.
  // But in this example everything is just done in one place for simplicity
  render() {
    const cards = this.props.playerHandData?.cards ?? [];
    return (
      <DragDropContext
        onDragEnd={this.onDragEnd}
        onBeforeCapture={this.onDragStart}
      >
        <Droppable droppableId="droppable" direction="horizontal">
          {(provided, snapshot) => (
            <div
              onClick={this.props.clearPreviewCardJsonId}
              ref={provided.innerRef}
              style={getListStyle(snapshot.isDraggingOver)}
              {...provided.droppableProps}
            >
              {cards.map((card, index) => (
                <Draggable
                  key={`player-hand-${this.props.playerNumber}-${index}`}
                  draggableId={`player-hand-${this.props.playerNumber}-${index}`}
                  index={index}
                >
                  {(provided, snapshot) => (
                    <div
                      onPointerEnter={(event) => {
                        if (event.pointerType === "mouse") {
                          this.props.setPreviewCardJsonId(card.jsonId);
                        }
                      }}
                      onPointerLeave={this.props.clearPreviewCardJsonId}
                      onClick={(event) => {
                        if (
                          (event.nativeEvent as PointerEvent).pointerType ===
                          "touch"
                        ) {
                          this.props.setPreviewCardJsonId(card.jsonId);
                          event.stopPropagation();
                        }
                      }}
                      className="player-hand-card"
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      {...provided.dragHandleProps}
                      style={getItemStyle(
                        snapshot,
                        provided.draggableProps.style
                      )}
                    >
                      {this.renderCardContents(card)}
                    </div>
                  )}
                </Draggable>
              ))}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
        {this.renderDroppableIfDragging()}
      </DragDropContext>
    );
  }

  renderCardContents(card: ICardDetails) {
    const imgs = getImgUrls(
      makeFakeCardStackFromJsonId(card.jsonId),
      this.props.playerCardData,
      this.props.currentGameType ?? GameType.MarvelChampions
    );

    imgs.forEach((i) => {
      if (this.state.imgUrlToStatusMap[i] === undefined) {
        this.setState({
          imgUrlToStatusMap: {
            ...this.state.imgUrlToStatusMap,
            [i]: ImageLoadingStatus.Loading,
          },
        });
      }
    });

    // Only want to show the first image if multiple are loaded
    const imgsWithData = imgs.map((i) => ({
      url: i,
      status: this.state.imgUrlToStatusMap[i],
    }));
    const loadedImgs = imgsWithData.filter(
      (iData) => iData.status === ImageLoadingStatus.Loaded
    );
    const firstLoadedImage = loadedImgs.length > 0 ? loadedImgs[0].url : null;

    return imgs.map((i, index) => {
      return (
        <img
          key={`card-${card.jsonId}-img-${index}`}
          className={i !== firstLoadedImage ? "hide-img" : "show-img"}
          onLoad={(event) => {
            this.setState({
              imgUrlToStatusMap: {
                ...this.state.imgUrlToStatusMap,
                [i]: ImageLoadingStatus.Loaded,
              },
            });
          }}
          alt="card"
          src={i}
        ></img>
      );
    });
  }

  renderDroppableIfDragging() {
    return true ? (
      <Droppable droppableId="droppable-while-dragging" direction="horizontal">
        {(provided, snapshot) => (
          <div
            className="card-dropzone"
            ref={provided.innerRef}
            style={getListStyle2(snapshot.isDraggingOver, this.state.dragging)}
            {...provided.droppableProps}
          >
            {provided.placeholder}
          </div>
        )}
      </Droppable>
    ) : null;
  }
}
export default PlayerHand;
