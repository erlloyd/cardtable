export enum CardSizeType {
  Standard = "standard",
  Tarot = "tarot",
  DoubleStandardVertical = "doublestandardvertical",
}

export const cardConstants = {
  [CardSizeType.Standard]: {
    CARD_HEIGHT: 209,
    CARD_WIDTH: 150,
    CARD_PREVIEW_HEIGHT: 418,
    CARD_PREVIEW_WIDTH: 300,
    MOUSE_DRAG_SPLIT_DISTANCE: 50,
    TOUCH_DRAG_SPLIT_DISTANCE: 100,
    GRID_SNAP_WIDTH: 209 + 20,
    GRID_SNAP_HEIGHT: 209 + 50,
    ATTACHMENT_OFFSET: 50,
  },
  [CardSizeType.Tarot]: {
    CARD_HEIGHT: 375,
    CARD_WIDTH: 250,
    CARD_PREVIEW_HEIGHT: 418,
    CARD_PREVIEW_WIDTH: 278,
    MOUSE_DRAG_SPLIT_DISTANCE: 50,
    TOUCH_DRAG_SPLIT_DISTANCE: 100,
    GRID_SNAP_WIDTH: 375 + 20,
    GRID_SNAP_HEIGHT: 375 + 50,
    ATTACHMENT_OFFSET: 50,
  },
  [CardSizeType.DoubleStandardVertical]: {
    CARD_HEIGHT: 418,
    CARD_WIDTH: 150,
    CARD_PREVIEW_HEIGHT: 0,
    CARD_PREVIEW_WIDTH: 0,
    MOUSE_DRAG_SPLIT_DISTANCE: 50,
    TOUCH_DRAG_SPLIT_DISTANCE: 100,
    GRID_SNAP_WIDTH: 209 + 20,
    GRID_SNAP_HEIGHT: 209 + 50,
    ATTACHMENT_OFFSET: 50,
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
