import { Vector2d } from "konva/lib/types";

export const getDistance = (point1: Vector2d, point2: Vector2d): number => {
  const deltaX = point1.x - point2.x;
  const deltaY = point1.y - point2.y;
  return Math.sqrt(deltaX * deltaX + deltaY * deltaY);
};

export const getCenter = (p1: Vector2d, p2: Vector2d) => {
  return {
    x: (p1.x + p2.x) / 2,
    y: (p1.y + p2.y) / 2,
  };
};
