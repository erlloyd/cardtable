import { Component, useCallback } from "react";
import { Vector2d } from "konva/lib/types";
import { Group, Rect, Text } from "react-konva";
import { KonvaEventObject } from "konva/lib/Node";
import { IPlayerBoard } from "./features/cards/initialState";
import PlayerBoard from "./PlayerBoard";
import { paginationClasses } from "@mui/material";

interface IProps {
  boards: IPlayerBoard[];
  movePlayerBoard: (payload: { id: string; newPos: Vector2d }) => void;
}

const PlayerBoards = (props: IProps) => {
  const dragEnd = useCallback(
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
      onDragEnd={dragEnd}
    ></PlayerBoard>
  ));
};

export default PlayerBoards;
