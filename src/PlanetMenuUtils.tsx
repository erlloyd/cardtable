import * as React from "react";
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

// export const getRenderTypeByPosition = (pos: Vector2d | null): RenderType => {
//   const adjustedPosition = pos
//     ? {
//         x: Math.min(
//           Math.max(pos.x - 32, minScreenOffset),
//           window.visualViewport.width - maxScreenOffset
//         ),
//         y: Math.min(
//           Math.max(pos.y - 32, minScreenOffset),
//           window.visualViewport.height - maxScreenOffset
//         ),
//       }
//     : { x: 0, y: 0 };

//   let renderType: RenderType = RenderType.Normal;

//   // Determine the fan type
//   if (!pos) {
//     renderType = RenderType.Normal;
//   } else if (
//     pos.x === adjustedPosition.x + 32 &&
//     pos.y !== adjustedPosition.y + 32 &&
//     adjustedPosition.y === minScreenOffset
//   ) {
//     renderType = RenderType.BottomFan;
//   } else if (
//     pos.y === adjustedPosition.y + 32 &&
//     pos.x !== adjustedPosition.x + 32 &&
//     adjustedPosition.x === minScreenOffset
//   ) {
//     renderType = RenderType.RightFan;
//   } else if (
//     pos.x === adjustedPosition.x + 32 &&
//     pos.y !== adjustedPosition.y + 32 &&
//     adjustedPosition.y === window.visualViewport.height - maxScreenOffset
//   ) {
//     renderType = RenderType.TopFan;
//   } else if (
//     pos.y === adjustedPosition.y + 32 &&
//     pos.x !== adjustedPosition.x + 32 &&
//     adjustedPosition.x === window.visualViewport.width - maxScreenOffset
//   ) {
//     renderType = RenderType.LeftFan;
//   } else if (
//     pos.x !== adjustedPosition.x + 32 &&
//     pos.y !== adjustedPosition.y + 32 &&
//     adjustedPosition.x === minScreenOffset &&
//     adjustedPosition.y === minScreenOffset
//   ) {
//     renderType = RenderType.LowerRightFan;
//   } else if (
//     pos.x !== adjustedPosition.x + 32 &&
//     pos.y !== adjustedPosition.y + 32 &&
//     adjustedPosition.x === window.visualViewport.width - maxScreenOffset &&
//     adjustedPosition.y === window.visualViewport.height - maxScreenOffset
//   ) {
//     renderType = RenderType.UpperLeftFan;
//   } else if (
//     pos.x !== adjustedPosition.x + 32 &&
//     pos.y !== adjustedPosition.y + 32 &&
//     adjustedPosition.x === minScreenOffset &&
//     adjustedPosition.y === window.visualViewport.height - maxScreenOffset
//   ) {
//     renderType = RenderType.UpperRightFan;
//   } else if (
//     pos.x !== adjustedPosition.x + 32 &&
//     pos.y !== adjustedPosition.y + 32 &&
//     adjustedPosition.x === window.visualViewport.width - maxScreenOffset &&
//     adjustedPosition.y === minScreenOffset
//   ) {
//     renderType = RenderType.LowerLeftFan;
//   }

//   return renderType;
// };

const secondaryThreshold = 200;

export const getRenderTypeByPosition = (pos: Vector2d | null): RenderType => {
  if (!pos) return RenderType.Normal;

  // If the screen is "landscape, prefer left/right fans, if the screen is widescreen, prefer top/bottom fans
  let primaryCoord: number;
  let primaryMax: number;
  let secondaryCoord: number;
  let secondaryMax: number;
  let lowerHalfFanType: RenderType;
  let upperHalfFanType: RenderType;
  let secondaryLowerHalfFanType: RenderType;
  let secondaryUpperHalfFanType: RenderType;
  let corner1FanType: RenderType;
  let corner2FanType: RenderType;

  if (window.visualViewport.height <= window.visualViewport.width) {
    primaryCoord = pos.y;
    primaryMax = window.visualViewport.height;
    secondaryCoord = pos.x;
    secondaryMax = window.visualViewport.width;
    lowerHalfFanType = RenderType.BottomFan;
    upperHalfFanType = RenderType.TopFan;
    secondaryLowerHalfFanType = RenderType.RightFan;
    secondaryUpperHalfFanType = RenderType.LeftFan;
    corner1FanType = RenderType.UpperRightFan;
    corner2FanType = RenderType.LowerLeftFan;
  } else {
    primaryCoord = pos.x;
    primaryMax = window.visualViewport.width;
    secondaryCoord = pos.y;
    secondaryMax = window.visualViewport.height;
    lowerHalfFanType = RenderType.RightFan;
    upperHalfFanType = RenderType.LeftFan;
    secondaryLowerHalfFanType = RenderType.BottomFan;
    secondaryUpperHalfFanType = RenderType.TopFan;
    corner1FanType = RenderType.LowerLeftFan;
    corner2FanType = RenderType.UpperRightFan;
  }

  let renderType = RenderType.Normal;

  // first, if we're close enough to both extremes (in a corner) do that fan
  if (
    secondaryCoord < secondaryThreshold &&
    primaryCoord < secondaryThreshold
  ) {
    renderType = RenderType.LowerRightFan;
  } else if (
    secondaryCoord > secondaryMax - secondaryThreshold &&
    primaryCoord > primaryMax - secondaryThreshold
  ) {
    renderType = RenderType.UpperLeftFan;
  } else if (
    secondaryCoord < secondaryThreshold &&
    primaryCoord > primaryMax - secondaryThreshold
  ) {
    renderType = corner1FanType;
  } else if (
    secondaryCoord > secondaryMax - secondaryThreshold &&
    primaryCoord < secondaryThreshold
  ) {
    renderType = corner2FanType;
  }

  // next, if we're withing some threshold of the secondary axis extremes, and close enough
  // to the middle of the primary axis, then use the secondary fan types
  else if (
    secondaryCoord < secondaryThreshold &&
    primaryCoord >= secondaryThreshold &&
    primaryCoord <= primaryMax - secondaryThreshold
  ) {
    renderType = secondaryLowerHalfFanType;
  } else if (
    secondaryCoord > secondaryMax - secondaryThreshold &&
    primaryCoord >= secondaryThreshold &&
    primaryCoord <= primaryMax - secondaryThreshold
  ) {
    renderType = secondaryUpperHalfFanType;
  } else if (primaryCoord < primaryMax / 2) {
    renderType = lowerHalfFanType;
  } else {
    renderType = upperHalfFanType;
  }

  return renderType;
};

export const convertItemsToFanType = (
  items: JSX.Element[],
  renderType: RenderType
) => {
  if (items.length < 4) {
    while (items.length < 4) {
      items.push(<div></div>);
    }
  }

  const halfNumber = Math.floor(items.length / 2);
  const quarterNumber = Math.floor(items.length / 4);
  const half = Math.ceil(items.length / 2);
  const quarter = Math.ceil(items.length / 4);
  const firstHalf = items.slice(0, half);
  const secondHalf = items.slice(-half);
  const firstQuarter = items.slice(0, quarter);
  const last3_4ths = items.slice(quarter);
  const first3_4ths = items.slice(0, items.length - quarter);
  const lastQuarter = items.slice(items.length - quarter);

  switch (renderType) {
    case RenderType.RightFan:
      items = Array(items.length)
        .map(() => {
          return <div></div>;
        })
        .concat(items);
      break;

    case RenderType.LeftFan:
      items = items.concat(
        Array(items.length).map(() => {
          return <div></div>;
        })
      );
      break;

    case RenderType.TopFan:
      items = Array(Math.floor(items.length / 2))
        .map(() => {
          return <div></div>;
        })
        .concat(items)
        .concat(
          Array(Math.floor(items.length / 2)).map(() => {
            return <div></div>;
          })
        );
      break;

    case RenderType.BottomFan:
      items = firstHalf
        .concat(
          Array(items.length).map(() => {
            return <div></div>;
          })
        )
        .concat(secondHalf);
      break;

    case RenderType.UpperLeftFan:
      items = Array(quarterNumber)
        .map(() => {
          return <div></div>;
        })
        .concat(items)
        .concat(
          Array(halfNumber + quarterNumber).map(() => {
            return <div></div>;
          })
        );
      break;

    case RenderType.UpperRightFan:
      items = Array(halfNumber + quarterNumber)
        .map(() => {
          return <div></div>;
        })
        .concat(items)
        .concat(
          Array(quarterNumber).map(() => {
            return <div></div>;
          })
        );
      break;

    case RenderType.LowerLeftFan:
      items = first3_4ths.concat(Array(items.length)).concat(lastQuarter);
      break;

    case RenderType.LowerRightFan:
      items = firstQuarter.concat(Array(items.length)).concat(last3_4ths);
      break;
  }

  return items;
};
