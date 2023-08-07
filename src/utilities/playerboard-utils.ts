import {
  DEFAULT_PLAYER_BOARD,
  IPlayerBoard,
  IPlayerBoardOptional,
} from "../features/cards/initialState";

export const makeBasicPlayerBoard = (
  options: IPlayerBoardOptional
): IPlayerBoard => {
  return { ...DEFAULT_PLAYER_BOARD, ...options };
};
