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

export const getPointsForCurvedArrow = (
  p1: Vector2d,
  p2: Vector2d
): Vector2d[] => {
  const midpoint = getCenter(p1, p2);

  // change in x and y
  let dx = p2.x - p1.x;
  let dy = p2.y - p1.y;

  // distance
  const dist = getDistance(p1, p2);

  // unit vector
  dx /= dist;
  dy /= dist;

  // Get the offset along the perpendicular line we want
  // to use. We want to scale up quickly from a flat line to our max
  // offset. So use a power function
  const powOffset = Math.pow(1.01, dist - 100);
  const offset = dist < 200 ? 0 : Math.min(100, powOffset);

  const offsetX = offset * dy;
  const offsetY = offset * dx;

  const curvePoint = { x: midpoint.x + offsetX, y: midpoint.y - offsetY };
  return [p1, curvePoint, p2];
};

export const getPointsForCurvedArrowFlattened = (
  p1: Vector2d,
  p2: Vector2d
): number[] => {
  return getPointsForCurvedArrow(p1, p2).reduce((prev, current) => {
    return prev.concat([current.x, current.y]);
  }, [] as number[]);
};
