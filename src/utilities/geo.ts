import { Vector2d } from "konva/types/types";

export const getDistance = (point1: Vector2d, point2: Vector2d): number => {
    const deltaX = point1.x - point2.x;
    const deltaY = point1.y - point2.y;
    return Math.sqrt(deltaX*deltaX + deltaY*deltaY);
}