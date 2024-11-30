import standard from "./swdbg_standard.json";
import standard_clone_wars from "./swdbg_standard_clone_wars.json";
import leaders_rebel from "./swdbg_solo_leaders_rebel.json";
import leaders_empire from "./swdbg_solo_leaders_empire.json";
import twoVtwo from "./swdbg_2v2.json";

export const scenarios = {
  [standard.Name]: standard,
  [standard_clone_wars.Name]: standard_clone_wars,
  [twoVtwo.Name]: twoVtwo,
  [leaders_rebel.Name]: leaders_rebel,
  [leaders_empire.Name]: leaders_empire,
};
