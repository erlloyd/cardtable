import { Vector2d } from "konva/lib/types";

export enum RenderType {
  Normal = "normal",
  LeftFan = "leftfan",
  RightFan = "rightfan",
  TopFan = "topfan",
  BottomFan = "bottomfan",
  LowerRightFan = "lowerrightfan",
  LowerLeftFan = "lowerleftfan",
  UpperRightFan = "upperrightfan",
  UpperLeftFan = "upperleftfan",
}

export const minScreenOffset = 128;
export const maxScreenOffset = 190;

export const getRenderTypeByPosition = (pos: Vector2d | null): RenderType => {
  const adjustedPosition = pos
    ? {
        x: Math.min(
          Math.max(pos.x - 32, minScreenOffset),
          window.visualViewport.width - maxScreenOffset
        ),
        y: Math.min(
          Math.max(pos.y - 32, minScreenOffset),
          window.visualViewport.height - maxScreenOffset
        ),
      }
    : { x: 0, y: 0 };

  let renderType: RenderType = RenderType.Normal;

  // Determine the fan type
  if (!pos) {
    renderType = RenderType.Normal;
  } else if (
    pos.x === adjustedPosition.x + 32 &&
    pos.y !== adjustedPosition.y + 32 &&
    adjustedPosition.y === minScreenOffset
  ) {
    renderType = RenderType.BottomFan;
  } else if (
    pos.y === adjustedPosition.y + 32 &&
    pos.x !== adjustedPosition.x + 32 &&
    adjustedPosition.x === minScreenOffset
  ) {
    renderType = RenderType.RightFan;
  } else if (
    pos.x === adjustedPosition.x + 32 &&
    pos.y !== adjustedPosition.y + 32 &&
    adjustedPosition.y === window.visualViewport.height - maxScreenOffset
  ) {
    renderType = RenderType.TopFan;
  } else if (
    pos.y === adjustedPosition.y + 32 &&
    pos.x !== adjustedPosition.x + 32 &&
    adjustedPosition.x === window.visualViewport.width - maxScreenOffset
  ) {
    renderType = RenderType.LeftFan;
  } else if (
    pos.x !== adjustedPosition.x + 32 &&
    pos.y !== adjustedPosition.y + 32 &&
    adjustedPosition.x === minScreenOffset &&
    adjustedPosition.y === minScreenOffset
  ) {
    renderType = RenderType.LowerRightFan;
  } else if (
    pos.x !== adjustedPosition.x + 32 &&
    pos.y !== adjustedPosition.y + 32 &&
    adjustedPosition.x === window.visualViewport.width - maxScreenOffset &&
    adjustedPosition.y === window.visualViewport.height - maxScreenOffset
  ) {
    renderType = RenderType.UpperLeftFan;
  } else if (
    pos.x !== adjustedPosition.x + 32 &&
    pos.y !== adjustedPosition.y + 32 &&
    adjustedPosition.x === minScreenOffset &&
    adjustedPosition.y === window.visualViewport.height - maxScreenOffset
  ) {
    renderType = RenderType.UpperRightFan;
  } else if (
    pos.x !== adjustedPosition.x + 32 &&
    pos.y !== adjustedPosition.y + 32 &&
    adjustedPosition.x === window.visualViewport.width - maxScreenOffset &&
    adjustedPosition.y === minScreenOffset
  ) {
    renderType = RenderType.LowerLeftFan;
  }

  return renderType;
};
