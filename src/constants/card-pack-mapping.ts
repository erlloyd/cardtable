// For some reason, the codes from marvelcdb and the images from cardgamedb can be off
export const CARD_PACK_REMAPPING: { [key: string]: string } = {
  bkw: "07",
  cap: "04",
  drs: "08",
  hlk: "09",
  trors: "10",
  twc: "03",
};

export const EXTRA_CARDS: { [key: string]: { [key: string]: number } } = {
  doctor_strange: {
    "09032": 1,
    "09033": 1,
    "09034": 1,
    "09035": 1,
    "09036": 1,
  },
};
