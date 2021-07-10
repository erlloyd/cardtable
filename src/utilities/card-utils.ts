import { myPeerRef } from "../constants/app-constants";
import { StatusTokenType } from "../constants/card-constants";
import { ICardStack } from "../features/cards/initialState";

export const anyCardStackHasStatus = (
  status: StatusTokenType,
  stacks: ICardStack[]
) => {
  return stacks.length > 0 && stacks.some((s) => s.statusTokens[status]);
};

export const getMySelectedCards = (stacks: ICardStack[]) => {
  return stacks.filter((c) => c.selected && c.controlledBy === myPeerRef);
};
