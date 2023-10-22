import fellowship from "./fellowship.json";
import trilogy from "./trilogy.json";
import duel2p from "./2pDuel.json";
import duel2pSolo from "./2pDuelSolo.json";
import duel3p from "./3pDuel.json";

export const scenarios = {
  [fellowship.Name]: fellowship,
  [trilogy.Name]: trilogy,
  [duel2p.Name]: duel2p,
  [duel3p.Name]: duel3p,
  [duel2pSolo.Name]: duel2pSolo,
};
