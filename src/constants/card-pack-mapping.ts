import { ICardDetails } from "../features/cards/initialState";

// For some reason, the codes from marvelcdb and the images from cardgamedb can be off
export const CARD_PACK_REMAPPING: { [key: string]: string } = {
  bkw: "07",
  cap: "04",
  drs: "08",
  hlk: "09",
  trors: "10",
  twc: "03",
};

// export const EXTRA_CARDS: { [key: string]: { [key: string]: number } } = {
//   doctor_strange: {
//     "09032": 1,
//     "09033": 1,
//     "09034": 1,
//     "09035": 1,
//     "09036": 1,
//   },
//   ant: {
//     "12001c": 1,
//   },
// };

export const EXTRA_CARDS: { [key: string]: ICardDetails[] } = {
  doctor_strange: [
    { jsonId: "09032" },
    { jsonId: "09033" },
    { jsonId: "09034" },
    { jsonId: "09035" },
    { jsonId: "09036" },
  ],
  ant: [{ jsonId: "12001c" }],
  wsp: [{ jsonId: "13001c" }],
  ironheart: [{ jsonId: "29002a" }, { jsonId: "29003a" }],
  spdr: [{ jsonId: "31002a" }],
};
