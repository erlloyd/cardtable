import { Vector2d } from "konva/types/types";

export interface IGameState {
  stageZoom: Vector2d;
  stagePosition: Vector2d;
}

export const initialState: IGameState = {
  stageZoom: { x: 1, y: 1 },
  stagePosition: { x: 0, y: 0 },
};
