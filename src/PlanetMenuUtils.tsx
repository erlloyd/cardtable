import * as React from "react";
import { Vector2d } from "konva/lib/types";
import cloneDeep from "lodash.clonedeep";

export interface MenuDataItem {
  rot: number;
  renderType: RenderType;
  // orbit: number;
}
export interface MenuData {
  [key: string]: MenuDataItem;
}

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

export const getRotFromRenderType = (renderType: RenderType): number => {
  let rot = 0;
  switch (renderType) {
    case RenderType.RightFan:
      rot = 0;
      break;
    case RenderType.LowerRightFan:
      rot = 30;
      break;
    case RenderType.BottomFan:
      rot = 90;
      break;
    case RenderType.LowerLeftFan:
      rot = 110;
      break;
    case RenderType.LeftFan:
      rot = 180;
      break;
    case RenderType.UpperLeftFan:
      rot = 205;
      break;
    case RenderType.TopFan:
      rot = 270;
      break;
    case RenderType.UpperRightFan:
      rot = 300;
      break;
  }

  return rot;
};

export const convertItemsToFanType = (
  items: JSX.Element[],
  renderType: RenderType
) => {
  const extraNodes =
    renderType === RenderType.LowerLeftFan ||
    renderType === RenderType.LowerRightFan ||
    renderType === RenderType.UpperLeftFan ||
    renderType === RenderType.UpperRightFan
      ? 4
      : 0;

  items = Array(items.length)
    .map(() => {
      return <div></div>;
    })
    .concat(
      Array(extraNodes).map(() => {
        return <div></div>;
      })
    )
    .concat(items);
  return items;
};

export const updateMenuDataForEvent = (
  evt: React.MouseEvent<HTMLDivElement>,
  key: string,
  menuData: MenuData,
  setMenuData: (d: MenuData) => void
) => {
  const clonedMenuData = cloneDeep(menuData);
  const rT = getRenderTypeByPosition({
    x: evt.clientX,
    y: evt.clientY,
  });
  const rot = getRotFromRenderType(rT);
  clonedMenuData[key] = {
    renderType: rT,
    rot,
  };
  setMenuData(clonedMenuData);
};
