import { RootState } from "./rootReducer";

export const loadState = (key: string) => {
  try {
    const serializedState = localStorage.getItem(key);
    if (serializedState === null) {
      return {};
    }
    return JSON.parse(serializedState);
  } catch (err) {
    return {};
  }
};

export const saveState = (state: RootState) => {
  const blacklistStateKeys = ["cardsData"];
  try {
    Object.entries(state).forEach(([key, value]) => {
      if (!blacklistStateKeys.includes(key)) {
        const serializedState = JSON.stringify(value);
        localStorage.setItem(key, serializedState);
      }
    });
  } catch {
    // ignore write errors
  }
};
