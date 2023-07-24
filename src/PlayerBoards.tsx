import { Component } from "react";
import { Vector2d } from "konva/lib/types";
import { Group, Rect, Text } from "react-konva";
import { KonvaEventObject } from "konva/lib/Node";
import { IPlayerBoard } from "./features/cards/initialState";
import PlayerBoard from "./PlayerBoard";
import { paginationClasses } from "@mui/material";

interface IProps {
  boards: IPlayerBoard[];
}

const PlayerBoards = (props: IProps) => {
  return props.boards.map((pb) => (
    <PlayerBoard
      key={`${pb.id}-pb`}
      id={pb.id}
      pos={{ x: pb.x, y: pb.y }}
      board={pb}
      handleContextMenu={() => {}}
      onDragEnd={() => {}}
    ></PlayerBoard>
  ));
};

export default PlayerBoards;
