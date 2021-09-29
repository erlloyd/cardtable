import React, { Component } from "react";
import {
  DragDropContext,
  Draggable,
  DraggableStateSnapshot,
  DraggingStyle,
  DragUpdate,
  Droppable,
  DropResult,
  NotDraggingStyle,
} from "react-beautiful-dnd";

interface Item {
  id: string;
  content: string;
}

// fake data generator
const getItems = (count: number): Item[] =>
  Array.from({ length: count }, (v, k) => k).map((k) => ({
    id: `item-${k}`,
    content: `item ${k}`,
  }));

// a little function to help us with reordering the result
const reorder = (
  list: Item[],
  startIndex: number,
  endIndex: number
): Item[] => {
  const result = Array.from(list);
  const [removed] = result.splice(startIndex, 1);
  result.splice(endIndex, 0, removed);

  return result;
};

const remove = (list: Item[], startIndex: number): Item[] => {
  const result = Array.from(list);
  result.splice(startIndex, 1);

  return result;
};

const grid = 8;

const getItemStyle = (
  snapshot: DraggableStateSnapshot,
  draggableStyle: any
): DraggingStyle | NotDraggingStyle | undefined => {
  if (snapshot.dropAnimation) {
    console.log("drop animating, snapshot", snapshot);
  }

  return snapshot.dropAnimation &&
    snapshot.draggingOver === "droppable-while-dragging"
    ? { ...draggableStyle, visibility: "hidden" }
    : {
        // some basic styles to make the items look a bit nicer
        userSelect: "none",
        padding: grid * 2,
        margin: `0 ${grid}px 0 0`,

        // change background colour if dragging
        background: snapshot.isDragging ? "lightgreen" : "grey",

        // styles we need to apply on draggables
        ...draggableStyle,
      };
};

const getListStyle = (isDraggingOver: boolean) =>
  ({
    background: isDraggingOver ? "lightblue" : "lightgrey",
    display: "flex",
    padding: grid,
    overflow: "auto",
    position: "absolute",
    width: "100vw",
    zIndex: 10000,
    boxSizing: "border-box",
  } as React.CSSProperties);

const getListStyle2 = (isDraggingOver: boolean, isDraggingAtAll: boolean) => {
  return {
    background: isDraggingOver ? "rgb(0,0,0,0)" : "red",
    display: isDraggingAtAll ? "flex" : "none",
    padding: grid,
    overflow: "auto",
    position: "absolute",
    top: "100px",
    height: "500px",
    width: "100vw",
    boxSizing: "border-box",
    zIndex: 10000,
  } as React.CSSProperties;
};

interface IProps {
  droppedOnTable: () => void;
}
interface IState {
  items: Item[];
  dragging: boolean;
}

class PlayerHand extends Component<IProps, IState> {
  constructor(props: IProps) {
    super(props);
    this.state = {
      items: getItems(6),
      dragging: false,
    };
    this.onDragEnd = this.onDragEnd.bind(this);
    this.onDragStart = this.onDragStart.bind(this);
    this.onDragUpdate = this.onDragUpdate.bind(this);
  }

  onDragStart() {
    this.setState({ dragging: true });
  }

  onDragEnd(result: DropResult, provided: any) {
    console.log("provided", provided);
    // dropped outside the list
    if (!result.destination) {
      this.setState({ dragging: false });
      return;
    }

    let items: Item[];
    if (result.destination?.droppableId !== result.source.droppableId) {
      items = remove(this.state.items, result.source.index);
      this.props.droppedOnTable();
    } else {
      items = reorder(
        this.state.items,
        result.source.index,
        result.destination.index
      );
    }

    this.setState({
      items,
      dragging: false,
    });
  }

  onDragUpdate(initial: DragUpdate) {
    console.log("initial ", initial);
  }

  // Normally you would want to split things out into separate components.
  // But in this example everything is just done in one place for simplicity
  render() {
    return (
      <DragDropContext
        onDragEnd={this.onDragEnd}
        onBeforeCapture={this.onDragStart}
        onDragUpdate={this.onDragUpdate}
      >
        <Droppable droppableId="droppable" direction="horizontal">
          {(provided, snapshot) => (
            <div
              ref={provided.innerRef}
              style={getListStyle(snapshot.isDraggingOver)}
              {...provided.droppableProps}
            >
              {this.state.items.map((item, index) => (
                <Draggable key={item.id} draggableId={item.id} index={index}>
                  {(provided, snapshot) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      {...provided.dragHandleProps}
                      style={getItemStyle(
                        snapshot,
                        provided.draggableProps.style
                      )}
                    >
                      {item.content}
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
