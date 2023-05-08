export const cardConstants = {
  CARD_HEIGHT: 209,
  CARD_WIDTH: 150,
  CARD_PREVIEW_HEIGHT: 418,
  CARD_PREVIEW_WIDTH: 300,
  MOUSE_DRAG_SPLIT_DISTANCE: 50,
  TOUCH_DRAG_SPLIT_DISTANCE: 100,
  GRID_SNAP_WIDTH: 209 + 20,
  GRID_SNAP_HEIGHT: 209 + 50,
  ATTACHMENT_OFFSET: 50,
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
