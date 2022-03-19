export const is_uiwebview = /(iPhone|iPod|iPad).*AppleWebKit(?!.*Safari)/i.test(
  navigator.userAgent
);
export const is_safari_or_uiwebview = /(iPhone|iPod|iPad).*AppleWebKit/i.test(
  navigator.userAgent
);
export const is_touch_supported = navigator.maxTouchPoints > 0;
