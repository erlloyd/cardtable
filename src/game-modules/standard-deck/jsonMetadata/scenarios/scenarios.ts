import standard from "./single_red_deck.json";
import standard_no_jokers from "./single_red_deck_no_jokers.json";

export const scenarios = {
  [standard.Name]: standard,
  [standard_no_jokers.Name]: standard_no_jokers,
};
