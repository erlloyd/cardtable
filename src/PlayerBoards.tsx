import { KonvaEventObject } from "konva/lib/Node";
import { Vector2d } from "konva/lib/types";
import { useCallback } from "react";
import PlayerBoard from "./PlayerBoard";
import { IPlayerBoard } from "./features/cards/initialState";

interface IProps {
  boards: IPlayerBoard[];
  movePlayerBoard: (payload: { id: string; newPos: Vector2d }) => void;
}

const PlayerBoards = (props: IProps) => {
  const moveBoard = useCallback(
    (id: string, event: KonvaEventObject<DragEvent>) => {
      if (props.movePlayerBoard) {
        props.movePlayerBoard({
          id,
          newPos: { x: event.target.x(), y: event.target.y() },
        });
      }
    },
    [props.movePlayerBoard]
  );

  return props.boards.map((pb) => (
    <PlayerBoard
      key={`${pb.id}-pb`}
      id={pb.id}
      pos={{ x: pb.x, y: pb.y }}
      board={pb}
      handleContextMenu={() => {}}
      onDragEnd={moveBoard}
      onDragMove={moveBoard}
    ></PlayerBoard>
  ));
};

export default PlayerBoards;
