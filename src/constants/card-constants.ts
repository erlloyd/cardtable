export enum CardSizeType {
  Standard = "standard",
  Tarot = "tarot",
  DoubleStandardVertical = "doublestandardvertical",
  PlayerBoard = "playerboard",
}

export enum CardAttachLocation {
  UpAndRight = "upandright",
  Below = "below",
  Left = "left",
  DownAndLeft = "downandleft",
}

export const cardConstants = {
  [CardSizeType.Standard]: {
    CARD_HEIGHT: 209,
    CARD_WIDTH: 150,
    CARD_PREVIEW_HEIGHT: 418,
    CARD_PREVIEW_WIDTH: 300,
    TOUCH_DRAG_SPLIT_DISTANCE: 100,
    GRID_SNAP_WIDTH: 209 + 20,
    GRID_SNAP_HEIGHT: 209 + 50,
    ATTACHMENT_OFFSET_UP_AND_RIGHT: 50,
    ATTACHMENT_OFFSET_BELOW: 35,
    ATTACHMENT_OFFSET_LEFT: 35,
    ATTACHMENT_OFFSET_DOWN_AND_LEFT: 50,
  },
  [CardSizeType.Tarot]: {
    CARD_HEIGHT: 375,
    CARD_WIDTH: 250,
    CARD_PREVIEW_HEIGHT: 522,
    CARD_PREVIEW_WIDTH: 348,
    TOUCH_DRAG_SPLIT_DISTANCE: 100,
    GRID_SNAP_WIDTH: 375 + 20,
    GRID_SNAP_HEIGHT: 375 + 50,
    ATTACHMENT_OFFSET_UP_AND_RIGHT: 50,
    ATTACHMENT_OFFSET_BELOW: 35,
    ATTACHMENT_OFFSET_LEFT: 35,
    ATTACHMENT_OFFSET_DOWN_AND_LEFT: 50,
  },
  [CardSizeType.DoubleStandardVertical]: {
    CARD_HEIGHT: 418,
    CARD_WIDTH: 150,
    CARD_PREVIEW_HEIGHT: 0,
    CARD_PREVIEW_WIDTH: 0,
    TOUCH_DRAG_SPLIT_DISTANCE: 100,
    GRID_SNAP_WIDTH: 209 + 20,
    GRID_SNAP_HEIGHT: 209 + 50,
    ATTACHMENT_OFFSET_UP_AND_RIGHT: 50,
    ATTACHMENT_OFFSET_BELOW: 35,
    ATTACHMENT_OFFSET_LEFT: 35,
    ATTACHMENT_OFFSET_DOWN_AND_LEFT: 50,
  },
  [CardSizeType.PlayerBoard]: {
    CARD_HEIGHT: 455,
    CARD_WIDTH: 350,
    CARD_PREVIEW_HEIGHT: 0,
    CARD_PREVIEW_WIDTH: 0,
    TOUCH_DRAG_SPLIT_DISTANCE: 100,
    GRID_SNAP_WIDTH: 209 + 20,
    GRID_SNAP_HEIGHT: 209 + 50,
    ATTACHMENT_OFFSET_UP_AND_RIGHT: 50,
    ATTACHMENT_OFFSET_BELOW: 35,
    ATTACHMENT_OFFSET_LEFT: 35,
    ATTACHMENT_OFFSET_DOWN_AND_LEFT: 50,
  },
};

export enum StatusTokenType {
  Stunned = "stunned",
  Confused = "confused",
  Tough = "tough",
}

export enum CounterTokenType {
  Damage = "damage",
  Threat = "threat",
  Generic = "generic",
  Acceleration = "acceleration",
}

export const stackShuffleAnimationMS = 200;
export const stackShuffleAnimationS = stackShuffleAnimationMS / 1000;
