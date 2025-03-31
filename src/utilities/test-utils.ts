import { CardSizeType } from "../constants/card-constants";
import { ICardStack } from "../features/cards/initialState";

/**
 * Creates a default ICardStack object for testing purposes
 * @param overrides - Optional properties to override the defaults
 * @returns A default ICardStack object
 */
export const createDefaultCardStack = (
  overrides?: Partial<ICardStack>
): ICardStack => {
  const defaultStack: ICardStack = {
    id: "test-stack-id",
    controlledBy: "",
    dragging: false,
    shuffling: false,
    exhausted: false,
    x: 0,
    y: 0,
    faceup: true,
    fill: "",
    selected: false,
    cardStack: [{ jsonId: "default-card-json-id" }], // Default card JSON ID for testing
    statusTokens: {
      stunned: 0,
      confused: 0,
      tough: 0,
    },
    counterTokensList: [],
    modifiers: {},
    extraIcons: [],
    sizeType: CardSizeType.Standard,
    topCardFaceup: false,
  };

  return {
    ...defaultStack,
    ...overrides,
  };
};
