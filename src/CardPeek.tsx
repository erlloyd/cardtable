import TopLayer from "./TopLayer";
import "./CardPeek.scss";
import { DragDropContext, Draggable, Droppable } from "react-beautiful-dnd";
interface IProps {
  visible: boolean;
  numToPeek: number | null;
  hideCardPeek: () => {};
}

// fake data generator
const getItems = (count: number) =>
  Array.from({ length: count }, (v, k) => k).map((k) => ({
    id: `item-${k}`,
    content: `item ${k}`,
  }));

const grid = 8;

const getItemStyle = (isDragging: boolean, draggableStyle: any) => ({
  // some basic styles to make the items look a bit nicer
  userSelect: "none",
  padding: grid * 2,
  margin: `0 ${grid}px 0 0`,
  //height: "28px",

  // change background colour if dragging
  background: isDragging ? "lightgreen" : "grey",

  // styles we need to apply on draggables
  ...draggableStyle,
});

const getListStyle = (isDraggingOver: boolean, itemsLength: number) => ({
  background: isDraggingOver ? "lightblue" : "lightgrey",
  //position: "absolute",
  //float: "left",
  display: "flex",
  padding: grid,
  margin: 12,
  width: itemsLength * 68,
});

const items = getItems(5);

const CardPeek = (props: IProps) => {
  return props.visible ? (
    <TopLayer
      staticPosition={true}
      trasparentBackground={true}
      offsetContent={false}
      position={{ x: 0, y: 0 }}
      completed={() => {
        props.hideCardPeek();
      }}
    >
      <div
        onClick={(event) => {
          event.stopPropagation();
          event.preventDefault();
          props.hideCardPeek();
        }}
        className="card-peek-wrapper"
      >
        <div className="peek-content">
          <DragDropContext onDragEnd={() => {}}>
            <Droppable droppableId="droppable0" direction="horizontal">
              {(provided, snapshot) => (
                <div
                  ref={provided.innerRef}
                  style={getListStyle(snapshot.isDraggingOver, items.length)}
                  {...provided.droppableProps}
                >
                  {items.map((item, index) => (
                    <Draggable
                      key={item.id}
                      draggableId={item.id}
                      index={index}
                    >
                      {(provided, snapshot) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          {...provided.dragHandleProps}
                          style={getItemStyle(
                            snapshot.isDragging,
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
          </DragDropContext>
        </div>
      </div>
    </TopLayer>
  ) : null;
};

export default CardPeek;
