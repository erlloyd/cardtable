export const cardConstants = {
  CARD_HEIGHT: 209,
  CARD_WIDTH: 150,
  CARD_PREVIEW_HEIGHT: 418,
  CARD_PREVIEW_WIDTH: 300,
  MOUSE_DRAG_SPLIT_DISTANCE: 50,
  TOUCH_DRAG_SPLIT_DISTANCE: 100,
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
}
