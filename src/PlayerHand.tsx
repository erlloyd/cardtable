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
import { IPlayerHand } from "./features/cards/initialState";
import "./PlayerHand.scss";

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
        padding: grid * 2,
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
    zIndex: 10000,
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
    zIndex: 10000,
  } as React.CSSProperties;
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
  playerHandData: IPlayerHand | null;
  playerNumber: number;
}
interface IState {
  dragging: boolean;
}

class PlayerHand extends Component<IProps, IState> {
  constructor(props: IProps) {
    super(props);
    this.state = {
      dragging: false,
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
      console.log(cardDroppedJson.jsonId);
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
                      className="player-hand-card"
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      {...provided.dragHandleProps}
                      style={getItemStyle(
                        snapshot,
                        provided.draggableProps.style
                      )}
                    >
                      {card.jsonId}
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
