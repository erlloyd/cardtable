type Aspect =
  | "Vigilance"
  | "Villainy"
  | "Heroism"
  | "Command"
  | "Aggression"
  | "Cunning";
type AspectMap = { S: Aspect };
type Trait = string;
type TraitMap = { S: Trait };
interface StarWarsUnlimitedCard {
  Set: string;
  Number: string;
  Name: string;
  Subtitle?: string;
  Type: string;
  Aspects: AspectMap[];
  Traits?: TraitMap[];
  Arenas?: string[];
  Cost?: string;
  Power?: string;
  HP?: string;
  FrontText?: string;
  EpicAction?: string;
  DoubleSided: boolean;
  BackText?: string;
  Rarity: "C" | "U" | "R" | "S" | "L";
  Unique: boolean;
  Keywords?: string[];
  Artist: string;
  FrontArt: string;
  BackArt?: string;
}

export const sample: StarWarsUnlimitedCard[] = [
  {
    Set: "SOR",
    Number: "001",
    Name: "Director Krennic",
    Subtitle: "Aspiring to Authority",
    Type: "Leader",
    Aspects: [
      {
        S: "Vigilance",
      },
      {
        S: "Villainy",
      },
    ],
    Traits: [
      {
        S: "IMPERIAL",
      },
      {
        S: "OFFICIAL",
      },
    ],
    Arenas: ["Ground"],
    Cost: "5",
    Power: "2",
    HP: "7",
    FrontText: "Each friendly damaged unit gets +1/+0.",
    EpicAction:
      "Epic Action: If you control 5 or more resources, deploy this leader.",
    DoubleSided: true,
    BackText:
      "Restore 2 (When this unit attacks, heal 2 damage from your base.) Each friendly damaged unit gets +1/+0.",
    Rarity: "C",
    Unique: true,
    Keywords: ["Restore"],
    Artist: "Ario Murti",
    FrontArt: "https://d3alac64utt23z.cloudfront.net/images/cards/SOR/001.png",
    BackArt: "https://d3alac64utt23z.cloudfront.net/images/cards/SOR/001-b.png",
  },
  {
    Set: "SOR",
    Number: "003",
    Name: "Chewbacca",
    Subtitle: "Walking Carpet",
    Type: "Leader",
    Aspects: [
      {
        S: "Vigilance",
      },
      {
        S: "Heroism",
      },
    ],
    Traits: [
      {
        S: "UNDERWORLD",
      },
      {
        S: "WOOKIEE",
      },
    ],
    Arenas: ["Ground"],
    Cost: "7",
    Power: "2",
    HP: "9",
    FrontText:
      "Action [{Exhaust}]: Play a unit that costs 3 or less from your hand (paying its cost). It gains Sentinel for this phase.",
    EpicAction:
      "Epic Action: If you control 7 or more resources, deploy this leader.",
    DoubleSided: true,
    BackText:
      "SENTINEL (Units in this arena can't attack your non-Sentinel units or your base.)\nGRIT (This unit gets +1/+0 for each damage on it.)",
    Rarity: "C",
    Unique: true,
    Keywords: ["Grit", "Sentinel"],
    Artist: "Eslam Aboshady",
    FrontArt: "https://d3alac64utt23z.cloudfront.net/images/cards/SOR/003.png",
    BackArt: "https://d3alac64utt23z.cloudfront.net/images/cards/SOR/003-b.png",
  },
  {
    Set: "SOR",
    Number: "005",
    Name: "Luke Skywalker",
    Subtitle: "Faithful Friend",
    Type: "Leader",
    Aspects: [
      {
        S: "Vigilance",
      },
      {
        S: "Heroism",
      },
    ],
    Traits: [
      {
        S: "FORCE",
      },
      {
        S: "REBEL",
      },
    ],
    Arenas: ["Ground"],
    Cost: "6",
    Power: "4",
    HP: "7",
    FrontText:
      "Action [{C=1}, {Exhaust}]: Give a Shield token to a Heroism unit you played this phase.",
    EpicAction:
      "Epic Action: If you control 6 or more resources, deploy this leader. (Flip him, ready him, and move him to the ground arena.)",
    DoubleSided: true,
    BackText: "On Attack: You may give another unit a Shield token.",
    Rarity: "S",
    Unique: true,
    Artist: "Borja Pindado",
    FrontArt: "https://d3alac64utt23z.cloudfront.net/images/cards/SOR/005.png",
    BackArt: "https://d3alac64utt23z.cloudfront.net/images/cards/SOR/005-b.png",
  },
  {
    Set: "SOR",
    Number: "007",
    Name: "Grand Moff Tarkin",
    Subtitle: "Oversector Governor",
    Type: "Leader",
    Aspects: [
      {
        S: "Command",
      },
      {
        S: "Villainy",
      },
    ],
    Traits: [
      {
        S: "IMPERIAL",
      },
      {
        S: "OFFICIAL",
      },
    ],
    Arenas: ["Ground"],
    Cost: "5",
    Power: "2",
    HP: "7",
    FrontText:
      "Action [{C=1}, {Exhaust}]: Give an Experience token to an IMPERIAL unit.",
    EpicAction:
      "Epic Action: If you control 5 or more resources, deploy this leader.",
    DoubleSided: true,
    BackText:
      "On Attack: You may give an Experience token to another IMPERIAL unit.",
    Rarity: "C",
    Unique: true,
    Artist: "Tomas Oleksak",
    FrontArt: "https://d3alac64utt23z.cloudfront.net/images/cards/SOR/007.png",
    BackArt: "https://d3alac64utt23z.cloudfront.net/images/cards/SOR/007-b.png",
  },
  {
    Set: "SOR",
    Number: "009",
    Name: "Leia Organa",
    Subtitle: "Alliance General",
    Type: "Leader",
    Aspects: [
      {
        S: "Command",
      },
      {
        S: "Heroism",
      },
    ],
    Traits: [
      {
        S: "REBEL",
      },
      {
        S: "OFFICIAL",
      },
    ],
    Arenas: ["Ground"],
    Cost: "5",
    Power: "3",
    HP: "6",
    FrontText:
      "Action [{Exhaust}]: Attack with a REBEL unit. Then, you may attack with another REBEL unit.",
    EpicAction:
      "Epic Action: If you control 5 or more resources, deploy this leader.",
    DoubleSided: true,
    BackText:
      "Raid 1 (This unit gets +1/+0 while attacking.)\nWhen this unit completes an attack: You may attack with another REBEL unit.",
    Rarity: "C",
    Unique: true,
    Keywords: ["Raid"],
    Artist: "Sandra Chlewińska",
    FrontArt: "https://d3alac64utt23z.cloudfront.net/images/cards/SOR/009.png",
    BackArt: "https://d3alac64utt23z.cloudfront.net/images/cards/SOR/009-b.png",
  },
  {
    Set: "SOR",
    Number: "010",
    Name: "Darth Vader",
    Subtitle: "Dark Lord of the Sith",
    Type: "Leader",
    Aspects: [
      {
        S: "Aggression",
      },
      {
        S: "Villainy",
      },
    ],
    Traits: [
      {
        S: "FORCE",
      },
      {
        S: "IMPERIAL",
      },
      {
        S: "SITH",
      },
    ],
    Arenas: ["Ground"],
    Cost: "7",
    Power: "5",
    HP: "8",
    FrontText:
      "Action [{C=1}, {Exhaust}]: If you played a Villainy card this phase, deal 1 damage to a unit and 1 damage to a base.",
    EpicAction:
      "Epic Action: If you control 7 or more resources, deploy this leader. (Flip him, ready him, and move him to the ground arena.)",
    DoubleSided: true,
    BackText: "On Attack: You may deal 2 damage to a unit.",
    Rarity: "S",
    Unique: true,
    Artist: "Borja Pindado",
    FrontArt: "https://d3alac64utt23z.cloudfront.net/images/cards/SOR/010.png",
    BackArt: "https://d3alac64utt23z.cloudfront.net/images/cards/SOR/010-b.png",
  },
  {
    Set: "SOR",
    Number: "011",
    Name: "Grand Inquisitor",
    Subtitle: "Hunting The Jedi",
    Type: "Leader",
    Aspects: [
      {
        S: "Aggression",
      },
      {
        S: "Villainy",
      },
    ],
    Traits: [
      {
        S: "FORCE",
      },
      {
        S: "IMPERIAL",
      },
      {
        S: "INQUISITOR",
      },
    ],
    Arenas: ["Ground"],
    Cost: "6",
    Power: "3",
    HP: "6",
    FrontText:
      "Action [{Exhaust}]: Deal 2 damage to a friendly unit with 3 or less power and ready it.",
    EpicAction:
      "Epic Action: If you control 6 or more resources, deploy this leader.",
    DoubleSided: true,
    BackText:
      "On Attack: You may deal 1 damage to another friendly unit with 3 or less power and ready it.",
    Rarity: "R",
    Unique: true,
    Artist: "Borja Pindado",
    FrontArt: "https://d3alac64utt23z.cloudfront.net/images/cards/SOR/011.png",
    BackArt: "https://d3alac64utt23z.cloudfront.net/images/cards/SOR/011-b.png",
  },
  {
    Set: "SOR",
    Number: "012",
    Name: "IG-88",
    Subtitle: "Ruthless Bounty Hunter",
    Type: "Leader",
    Aspects: [
      {
        S: "Aggression",
      },
      {
        S: "Villainy",
      },
    ],
    Traits: [
      {
        S: "UNDERWORLD",
      },
      {
        S: "DROID",
      },
      {
        S: "BOUNTY HUNTER",
      },
    ],
    Arenas: ["Ground"],
    Cost: "5",
    Power: "5",
    HP: "4",
    FrontText:
      "Action [{Exhaust}]: Attack with a unit. If you control more units than the defending player, the attacker gets +1/+0 for this attack.",
    EpicAction:
      "Epic Action: If you control 5 or more resources, deploy this leader.",
    DoubleSided: true,
    BackText:
      "Each other friendly unit gains Raid 1. (They get +1/+0 while attacking.)",
    Rarity: "C",
    Unique: true,
    Keywords: ["Raid"],
    Artist: "Hoan Nguyen",
    FrontArt: "https://d3alac64utt23z.cloudfront.net/images/cards/SOR/012.png",
    BackArt: "https://d3alac64utt23z.cloudfront.net/images/cards/SOR/012-b.png",
  },
  {
    Set: "SOR",
    Number: "014",
    Name: "Sabine Wren",
    Subtitle: "Galvanized Revolutionary",
    Type: "Leader",
    Aspects: [
      {
        S: "Aggression",
      },
      {
        S: "Heroism",
      },
    ],
    Traits: [
      {
        S: "MANDALORIAN",
      },
      {
        S: "REBEL",
      },
      {
        S: "SPECTRE",
      },
    ],
    Arenas: ["Ground"],
    Cost: "4",
    Power: "2",
    HP: "5",
    FrontText: "Action [{Exhaust}]: Deal 1 damage to each base.",
    EpicAction:
      "Epic Action: If you control 4 or more resources, deploy this leader.",
    DoubleSided: true,
    BackText: "On Attack: Deal 1 damage to each enemy base.",
    Rarity: "C",
    Unique: true,
    Artist: "Eslam Aboshady",
    FrontArt: "https://d3alac64utt23z.cloudfront.net/images/cards/SOR/014.png",
    BackArt: "https://d3alac64utt23z.cloudfront.net/images/cards/SOR/014-b.png",
  },
  {
    Set: "SOR",
    Number: "015",
    Name: "Boba Fett",
    Subtitle: "Collecting the Bounty",
    Type: "Leader",
    Aspects: [
      {
        S: "Cunning",
      },
      {
        S: "Villainy",
      },
    ],
    Traits: [
      {
        S: "UNDERWORLD",
      },
      {
        S: "BOUNTY HUNTER",
      },
    ],
    Arenas: ["Ground"],
    Cost: "5",
    Power: "4",
    HP: "7",
    FrontText:
      "When an enemy unit leaves play: You may exhaust this leader. If you do, ready a resource.",
    EpicAction:
      "Epic Action: If you control 5 or more resources, deploy this leader.",
    DoubleSided: true,
    BackText:
      "When this unit completes an attack: If an enemy unit left play this phase, ready up to 2 resources.",
    Rarity: "C",
    Unique: true,
    Artist: "French Carlomagno",
    FrontArt: "https://d3alac64utt23z.cloudfront.net/images/cards/SOR/015.png",
    BackArt: "https://d3alac64utt23z.cloudfront.net/images/cards/SOR/015-b.png",
  },
  {
    Set: "SOR",
    Number: "017",
    Name: "Han Solo",
    Subtitle: "Audacious Smuggler",
    Type: "Leader",
    Aspects: [
      {
        S: "Cunning",
      },
      {
        S: "Heroism",
      },
    ],
    Traits: [
      {
        S: "UNDERWORLD",
      },
    ],
    Arenas: ["Ground"],
    Cost: "6",
    Power: "4",
    HP: "6",
    FrontText:
      "Action [{Exhaust}]: Put a card from your hand into play as a resource and ready it. At the start of the next action phase, defeat a resource you control.",
    EpicAction:
      "Epic Action: If you control 6 or more resources, deploy this leader.",
    DoubleSided: true,
    BackText:
      "On Attack: Put the top card of your deck into play as a resource and ready it. At the start of the next action phase, defeat a resource you control.",
    Rarity: "R",
    Unique: true,
    Artist: "David Nash",
    FrontArt: "https://d3alac64utt23z.cloudfront.net/images/cards/SOR/017.png",
    BackArt: "https://d3alac64utt23z.cloudfront.net/images/cards/SOR/017-b.png",
  },
  {
    Set: "SOR",
    Number: "019",
    Name: "Security Complex",
    Subtitle: "Scarif",
    Type: "Base",
    Aspects: [
      {
        S: "Vigilance",
      },
    ],
    HP: "25",
    FrontText: "Epic Action: Give a Shield token to a non-leader unit.",
    DoubleSided: false,
    Rarity: "R",
    Unique: false,
    Artist: "Tyler Edlin",
    FrontArt: "https://d3alac64utt23z.cloudfront.net/images/cards/SOR/019.png",
  },
  {
    Set: "SOR",
    Number: "021",
    Name: "Dagobah Swamp",
    Subtitle: "Dagobah",
    Type: "Base",
    Aspects: [
      {
        S: "Vigilance",
      },
    ],
    HP: "30",
    DoubleSided: false,
    Rarity: "C",
    Unique: false,
    Artist: "Tyler Edlin",
    FrontArt: "https://d3alac64utt23z.cloudfront.net/images/cards/SOR/021.png",
  },
  {
    Set: "SOR",
    Number: "022",
    Name: "Energy Conversion Lab",
    Subtitle: "Eadu",
    Type: "Base",
    Aspects: [
      {
        S: "Command",
      },
    ],
    HP: "25",
    FrontText:
      "Epic Action: Play a unit that costs 6 or less from your hand. Give it AMBUSH for this phase.",
    DoubleSided: false,
    Rarity: "R",
    Unique: false,
    Keywords: ["Ambush"],
    Artist: "Adrien Girod",
    FrontArt: "https://d3alac64utt23z.cloudfront.net/images/cards/SOR/022.png",
  },
  {
    Set: "SOR",
    Number: "023",
    Name: "Command Center",
    Subtitle: "Death Star",
    Type: "Base",
    Aspects: [
      {
        S: "Command",
      },
    ],
    HP: "30",
    DoubleSided: false,
    Rarity: "C",
    Unique: false,
    Artist: "Stephen Zavala",
    FrontArt: "https://d3alac64utt23z.cloudfront.net/images/cards/SOR/023.png",
  },
  {
    Set: "SOR",
    Number: "026",
    Name: "Catacombs of Cadera",
    Subtitle: "Jedha",
    Type: "Base",
    Aspects: [
      {
        S: "Aggression",
      },
    ],
    HP: "30",
    DoubleSided: false,
    Rarity: "C",
    Unique: false,
    Artist: "Tyler Edlin",
    FrontArt: "https://d3alac64utt23z.cloudfront.net/images/cards/SOR/026.png",
  },
  {
    Set: "SOR",
    Number: "029",
    Name: "Administrator's Tower",
    Subtitle: "Cloud City",
    Type: "Base",
    Aspects: [
      {
        S: "Cunning",
      },
    ],
    HP: "30",
    DoubleSided: false,
    Rarity: "C",
    Unique: false,
    Artist: "Tyler Edlin",
    FrontArt: "https://d3alac64utt23z.cloudfront.net/images/cards/SOR/029.png",
  },
  {
    Set: "SOR",
    Number: "033",
    Name: "Death Trooper",
    Type: "Unit",
    Aspects: [
      {
        S: "Vigilance",
      },
      {
        S: "Villainy",
      },
    ],
    Traits: [
      {
        S: "IMPERIAL",
      },
      {
        S: "TROOPER",
      },
    ],
    Arenas: ["Ground"],
    Cost: "3",
    Power: "3",
    HP: "3",
    FrontText:
      "When Played: Deal 2 damage to a friendly ground unit and 2 damage to an enemy ground unit.",
    DoubleSided: false,
    Rarity: "C",
    Unique: false,
    Artist: "Borja Pindado",
    FrontArt: "https://d3alac64utt23z.cloudfront.net/images/cards/SOR/033.png",
  },
  {
    Set: "SOR",
    Number: "035",
    Name: "Lieutenant Childsen",
    Subtitle: "Death Star Prison Warden",
    Type: "Unit",
    Aspects: [
      {
        S: "Vigilance",
      },
      {
        S: "Villainy",
      },
    ],
    Traits: [
      {
        S: "IMPERIAL",
      },
      {
        S: "OFFICIAL",
      },
    ],
    Arenas: ["Ground"],
    Cost: "4",
    Power: "2",
    HP: "2",
    FrontText:
      "Sentinel (Units in this arena can't attack your non-sentinel units or your base.)\nWhen Played: Reveal up to 4 Vigilance cards from your hand. For each card revealed this way, give an Experience token to this unit.",
    DoubleSided: false,
    Rarity: "U",
    Unique: true,
    Keywords: ["Sentinel"],
    Artist: "Yvette Chua",
    FrontArt: "https://d3alac64utt23z.cloudfront.net/images/cards/SOR/035.png",
  },
  {
    Set: "SOR",
    Number: "044",
    Name: "Restored ARC-170",
    Type: "Unit",
    Aspects: [
      {
        S: "Vigilance",
      },
      {
        S: "Heroism",
      },
    ],
    Traits: [
      {
        S: "REBEL",
      },
      {
        S: "VEHICLE",
      },
      {
        S: "FIGHTER",
      },
    ],
    Arenas: ["Space"],
    Cost: "2",
    Power: "2",
    HP: "3",
    FrontText:
      "Restore 1 (When this unit attacks, heal 1 damage from your base.)",
    DoubleSided: false,
    Rarity: "C",
    Unique: false,
    Keywords: ["Restore"],
    Artist: "Arthur Mougne",
    FrontArt: "https://d3alac64utt23z.cloudfront.net/images/cards/SOR/044.png",
  },
  {
    Set: "SOR",
    Number: "045",
    Name: "Yoda",
    Subtitle: "Old Master",
    Type: "Unit",
    Aspects: [
      {
        S: "Vigilance",
      },
      {
        S: "Heroism",
      },
    ],
    Traits: [
      {
        S: "FORCE",
      },
      {
        S: "JEDI",
      },
    ],
    Arenas: ["Ground"],
    Cost: "3",
    Power: "2",
    HP: "4",
    FrontText:
      "Restore 2 (When this unit attacks, heal 2 damage from your base.)\nWhen Defeated: Choose any number of players. They each draw a card.",
    DoubleSided: false,
    Rarity: "U",
    Unique: true,
    Keywords: ["Restore"],
    Artist: "Alexandria Huntington",
    FrontArt: "https://d3alac64utt23z.cloudfront.net/images/cards/SOR/045.png",
  },
  {
    Set: "SOR",
    Number: "046",
    Name: "Consular Security Force",
    Type: "Unit",
    Aspects: [
      {
        S: "Vigilance",
      },
      {
        S: "Heroism",
      },
    ],
    Traits: [
      {
        S: "REBEL",
      },
      {
        S: "TROOPER",
      },
    ],
    Arenas: ["Ground"],
    Cost: "4",
    Power: "3",
    HP: "7",
    DoubleSided: false,
    Rarity: "C",
    Unique: false,
    Artist: "Rebecca Farrow",
    FrontArt: "https://d3alac64utt23z.cloudfront.net/images/cards/SOR/046.png",
  },
  {
    Set: "SOR",
    Number: "047",
    Name: "Kanan Jarrus",
    Subtitle: "Revealed Jedi",
    Type: "Unit",
    Aspects: [
      {
        S: "Vigilance",
      },
      {
        S: "Heroism",
      },
    ],
    Traits: [
      {
        S: "FORCE",
      },
      {
        S: "JEDI",
      },
      {
        S: "REBEL",
      },
      {
        S: "SPECTRE",
      },
    ],
    Arenas: ["Ground"],
    Cost: "4",
    Power: "4",
    HP: "5",
    FrontText:
      "On Attack: You may discard 1 card from the defending player's deck for each friendly SPECTRE unit. Heal 1 damage from your base for each different aspect among the discarded cards.",
    DoubleSided: false,
    Rarity: "U",
    Unique: true,
    Artist: "Sandra Chlewińska",
    FrontArt: "https://d3alac64utt23z.cloudfront.net/images/cards/SOR/047.png",
  },
  {
    Set: "SOR",
    Number: "048",
    Name: "Vigilant Honor Guards",
    Type: "Unit",
    Aspects: [
      {
        S: "Vigilance",
      },
      {
        S: "Heroism",
      },
    ],
    Traits: [
      {
        S: "REBEL",
      },
    ],
    Arenas: ["Ground"],
    Cost: "5",
    Power: "4",
    HP: "6",
    FrontText:
      "While this unit is undamaged, it gains Sentinel (Units in this arena can't attack your non-Sentinel units or your base.)",
    DoubleSided: false,
    Rarity: "C",
    Unique: false,
    Keywords: ["Sentinel"],
    Artist: "Amad Mir",
    FrontArt: "https://d3alac64utt23z.cloudfront.net/images/cards/SOR/048.png",
  },
  {
    Set: "SOR",
    Number: "049",
    Name: "Obi-Wan Kenobi",
    Subtitle: "Following Fate",
    Type: "Unit",
    Aspects: [
      {
        S: "Vigilance",
      },
      {
        S: "Heroism",
      },
    ],
    Traits: [
      {
        S: "FORCE",
      },
      {
        S: "JEDI",
      },
    ],
    Arenas: ["Ground"],
    Cost: "6",
    Power: "4",
    HP: "6",
    FrontText:
      "Sentinel (Units in this arena can't attack your non-Sentinel units or your base.) \nWhen Defeated: Give 2 Experience tokens to another friendly unit. If it's a FORCE unit, draw a card.",
    DoubleSided: false,
    Rarity: "R",
    Unique: true,
    Keywords: ["Sentinel"],
    Artist: "Amélie Hutt",
    FrontArt: "https://d3alac64utt23z.cloudfront.net/images/cards/SOR/049.png",
  },
  {
    Set: "SOR",
    Number: "053",
    Name: "Luke's Lightsaber",
    Type: "Upgrade",
    Aspects: [
      {
        S: "Vigilance",
      },
      {
        S: "Heroism",
      },
    ],
    Traits: [
      {
        S: "ITEM",
      },
      {
        S: "WEAPON",
      },
      {
        S: "LIGHTSABER",
      },
    ],
    Cost: "2",
    Power: "3",
    HP: "1",
    FrontText:
      "Attach to a non-VEHICLE unit.\nWhen Played: If attached unit is Luke Skywalker, heal all damage from him and give a Shield token to him.",
    DoubleSided: false,
    Rarity: "S",
    Unique: true,
    Artist: "French Carlomagno",
    FrontArt: "https://d3alac64utt23z.cloudfront.net/images/cards/SOR/053.png",
  },
  {
    Set: "SOR",
    Number: "058",
    Name: "Vigilance",
    Type: "Event",
    Aspects: [
      {
        S: "Vigilance",
      },
      {
        S: "Vigilance",
      },
    ],
    Traits: [
      {
        S: "INNATE",
      },
    ],
    Cost: "4",
    FrontText:
      "Choose two, in any order:\nDiscard 6 cards from an opponent's deck. \nHeal 5 damage from a base. \nDefeat a unit with 3 or less remaining HP. \nGive a Shield token to a unit.",
    DoubleSided: false,
    Rarity: "L",
    Unique: false,
    Artist: "Cristina Laviña",
    FrontArt: "https://d3alac64utt23z.cloudfront.net/images/cards/SOR/058.png",
  },
  {
    Set: "SOR",
    Number: "059",
    Name: "2-1B Surgical Droid",
    Type: "Unit",
    Aspects: [
      {
        S: "Vigilance",
      },
    ],
    Traits: [
      {
        S: "DROID",
      },
    ],
    Arenas: ["Ground"],
    Cost: "1",
    Power: "1",
    HP: "3",
    FrontText: "On Attack: You may heal 2 damage from another unit.",
    DoubleSided: false,
    Rarity: "C",
    Unique: false,
    Artist: "Hoan Nguyen",
    FrontArt: "https://d3alac64utt23z.cloudfront.net/images/cards/SOR/059.png",
  },
  {
    Set: "SOR",
    Number: "060",
    Name: "Distant Patroller",
    Type: "Unit",
    Aspects: [
      {
        S: "Vigilance",
      },
    ],
    Traits: [
      {
        S: "FRINGE",
      },
      {
        S: "VEHICLE",
      },
      {
        S: "FIGHTER",
      },
    ],
    Arenas: ["Space"],
    Cost: "2",
    Power: "2",
    HP: "1",
    FrontText:
      "When Defeated: You may give a Shield token to a Vigilance unit.",
    DoubleSided: false,
    Rarity: "U",
    Unique: false,
    Artist: "Francois Cannels",
    FrontArt: "https://d3alac64utt23z.cloudfront.net/images/cards/SOR/060.png",
  },
  {
    Set: "SOR",
    Number: "063",
    Name: "Cloud City Wing Guard",
    Type: "Unit",
    Aspects: [
      {
        S: "Vigilance",
      },
    ],
    Traits: [
      {
        S: "FRINGE",
      },
      {
        S: "TROOPER",
      },
    ],
    Arenas: ["Ground"],
    Cost: "3",
    Power: "2",
    HP: "4",
    FrontText:
      "Sentinel (Units in this arena can't attack your non-Sentinel units or your base.)",
    DoubleSided: false,
    Rarity: "C",
    Unique: false,
    Keywords: ["Sentinel"],
    Artist: "Tomas Oleksak",
    FrontArt: "https://d3alac64utt23z.cloudfront.net/images/cards/SOR/063.png",
  },
  {
    Set: "SOR",
    Number: "066",
    Name: "System Patrol Craft",
    Type: "Unit",
    Aspects: [
      {
        S: "Vigilance",
      },
    ],
    Traits: [
      {
        S: "VEHICLE",
      },
      {
        S: "FIGHTER",
      },
    ],
    Arenas: ["Space"],
    Cost: "4",
    Power: "3",
    HP: "4",
    FrontText:
      "Sentinel (Units in this arena can't attack your non-Sentinel units or your base.)",
    DoubleSided: false,
    Rarity: "C",
    Unique: false,
    Keywords: ["Sentinel"],
    Artist: "Christian Papazoglakis",
    FrontArt: "https://d3alac64utt23z.cloudfront.net/images/cards/SOR/066.png",
  },
  {
    Set: "SOR",
    Number: "067",
    Name: "Rugged Survivors",
    Type: "Unit",
    Aspects: [
      {
        S: "Vigilance",
      },
    ],
    Traits: [
      {
        S: "FRINGE",
      },
    ],
    Arenas: ["Ground"],
    Cost: "5",
    Power: "3",
    HP: "5",
    FrontText:
      "Grit (This unit gets +1/+0 for each damage on it.)\nOn Attack: If you control a leader unit, you may draw a card.",
    DoubleSided: false,
    Rarity: "C",
    Unique: false,
    Keywords: ["Grit"],
    Artist: "Elena Skitalets",
    FrontArt: "https://d3alac64utt23z.cloudfront.net/images/cards/SOR/067.png",
  },
  {
    Set: "SOR",
    Number: "069",
    Name: "Resilient",
    Type: "Upgrade",
    Aspects: [
      {
        S: "Vigilance",
      },
    ],
    Traits: [
      {
        S: "INNATE",
      },
    ],
    Cost: "1",
    Power: "0",
    HP: "3",
    DoubleSided: false,
    Rarity: "C",
    Unique: false,
    Artist: "Joshua Carson",
    FrontArt: "https://d3alac64utt23z.cloudfront.net/images/cards/SOR/069.png",
  },
  {
    Set: "SOR",
    Number: "072",
    Name: "Entrenched",
    Type: "Upgrade",
    Aspects: [
      {
        S: "Vigilance",
      },
    ],
    Traits: [
      {
        S: "CONDITION",
      },
    ],
    Cost: "2",
    Power: "3",
    HP: "3",
    FrontText: "Attached unit can't attack bases.",
    DoubleSided: false,
    Rarity: "U",
    Unique: false,
    Artist: "Borja Pindado",
    FrontArt: "https://d3alac64utt23z.cloudfront.net/images/cards/SOR/072.png",
  },
  {
    Set: "SOR",
    Number: "074",
    Name: "Repair",
    Type: "Event",
    Aspects: [
      {
        S: "Vigilance",
      },
    ],
    Traits: [
      {
        S: "SUPPLY",
      },
    ],
    Cost: "1",
    FrontText: "Heal 3 damage from a unit or base.",
    DoubleSided: false,
    Rarity: "C",
    Unique: false,
    Artist: "Joshua Carson",
    FrontArt: "https://d3alac64utt23z.cloudfront.net/images/cards/SOR/074.png",
  },
  {
    Set: "SOR",
    Number: "075",
    Name: "It Binds All Things",
    Type: "Event",
    Aspects: [
      {
        S: "Vigilance",
      },
    ],
    Traits: [
      {
        S: "FORCE",
      },
    ],
    Cost: "2",
    FrontText:
      "Heal up to 3 damage from a unit. If you control a FORCE unit, you may deal that much damage to another unit.",
    DoubleSided: false,
    Rarity: "R",
    Unique: false,
    Artist: "Amélie Hutt",
    FrontArt: "https://d3alac64utt23z.cloudfront.net/images/cards/SOR/075.png",
  },
  {
    Set: "SOR",
    Number: "077",
    Name: "Takedown",
    Type: "Event",
    Aspects: [
      {
        S: "Vigilance",
      },
    ],
    Traits: [
      {
        S: "TACTIC",
      },
    ],
    Cost: "4",
    FrontText: "Defeat a unit with 5 or less remaining HP.",
    DoubleSided: false,
    Rarity: "U",
    Unique: false,
    Artist: "Eslam Aboshady",
    FrontArt: "https://d3alac64utt23z.cloudfront.net/images/cards/SOR/077.png",
  },
  {
    Set: "SOR",
    Number: "078",
    Name: "Vanquish",
    Type: "Event",
    Aspects: [
      {
        S: "Vigilance",
      },
    ],
    Traits: [
      {
        S: "TACTIC",
      },
    ],
    Cost: "5",
    FrontText: "Defeat a non-leader unit.",
    DoubleSided: false,
    Rarity: "C",
    Unique: false,
    Artist: "Eslam Aboshady",
    FrontArt: "https://d3alac64utt23z.cloudfront.net/images/cards/SOR/078.png",
  },
  {
    Set: "SOR",
    Number: "079",
    Name: "Admiral Piett",
    Subtitle: "Captain of the Executor",
    Type: "Unit",
    Aspects: [
      {
        S: "Command",
      },
      {
        S: "Villainy",
      },
    ],
    Traits: [
      {
        S: "IMPERIAL",
      },
      {
        S: "OFFICIAL",
      },
    ],
    Arenas: ["Ground"],
    Cost: "2",
    Power: "1",
    HP: "4",
    FrontText:
      "Each friendly non-leader unit that costs 6 or more gains AMBUSH. (After you play that unit, it may ready and attack an enemy unit.)",
    DoubleSided: false,
    Rarity: "U",
    Unique: true,
    Keywords: ["Ambush"],
    Artist: "Denis Medri",
    FrontArt: "https://d3alac64utt23z.cloudfront.net/images/cards/SOR/079.png",
  },
  {
    Set: "SOR",
    Number: "082",
    Name: "Emperor's Royal Guard",
    Type: "Unit",
    Aspects: [
      {
        S: "Command",
      },
      {
        S: "Villainy",
      },
    ],
    Traits: [
      {
        S: "IMPERIAL",
      },
    ],
    Arenas: ["Ground"],
    Cost: "3",
    Power: "3",
    HP: "4",
    FrontText:
      "While you control an OFFICIAL unit, this unit gains Sentinel.\nWhile you control Emperor Palpatine (as a leader or unit), this unit gets +0/+1.",
    DoubleSided: false,
    Rarity: "R",
    Unique: false,
    Keywords: ["Sentinel"],
    Artist: "French Carlomagno",
    FrontArt: "https://d3alac64utt23z.cloudfront.net/images/cards/SOR/082.png",
  },
  {
    Set: "SOR",
    Number: "083",
    Name: "Superlaser Technician",
    Type: "Unit",
    Aspects: [
      {
        S: "Command",
      },
      {
        S: "Villainy",
      },
    ],
    Traits: [
      {
        S: "IMPERIAL",
      },
    ],
    Arenas: ["Ground"],
    Cost: "3",
    Power: "2",
    HP: "1",
    FrontText:
      "When Defeated: You may put this unit into play as a resource and ready it.",
    DoubleSided: false,
    Rarity: "C",
    Unique: false,
    Artist: "Denis Medri",
    FrontArt: "https://d3alac64utt23z.cloudfront.net/images/cards/SOR/083.png",
  },
  {
    Set: "SOR",
    Number: "084",
    Name: "Grand Moff Tarkin",
    Subtitle: "Death Star Overseer",
    Type: "Unit",
    Aspects: [
      {
        S: "Command",
      },
      {
        S: "Villainy",
      },
    ],
    Traits: [
      {
        S: "IMPERIAL",
      },
      {
        S: "OFFICIAL",
      },
    ],
    Arenas: ["Ground"],
    Cost: "4",
    Power: "2",
    HP: "3",
    FrontText:
      "When Played: Search the top 5 cards of your deck for up to 2 IMPERIAL units, reveal them, and draw them. (Put the other cards on the bottom of your deck in a random order.)",
    DoubleSided: false,
    Rarity: "S",
    Unique: true,
    Artist: "Steve Morris",
    FrontArt: "https://d3alac64utt23z.cloudfront.net/images/cards/SOR/084.png",
  },
  {
    Set: "SOR",
    Number: "086",
    Name: "Gladiator Star Destroyer",
    Type: "Unit",
    Aspects: [
      {
        S: "Command",
      },
      {
        S: "Villainy",
      },
    ],
    Traits: [
      {
        S: "IMPERIAL",
      },
      {
        S: "VEHICLE",
      },
      {
        S: "CAPITAL SHIP",
      },
    ],
    Arenas: ["Space"],
    Cost: "6",
    Power: "5",
    HP: "6",
    FrontText:
      "When Played: Give a unit Sentinel for this phase. (Units in this arena can't attack your non-Sentinel units or your base.)",
    DoubleSided: false,
    Rarity: "C",
    Unique: false,
    Keywords: ["Sentinel"],
    Artist: "Arthur Mougne",
    FrontArt: "https://d3alac64utt23z.cloudfront.net/images/cards/SOR/086.png",
  },
  {
    Set: "SOR",
    Number: "088",
    Name: "Blizzard Assault AT-AT",
    Type: "Unit",
    Aspects: [
      {
        S: "Command",
      },
      {
        S: "Villainy",
      },
    ],
    Traits: [
      {
        S: "IMPERIAL",
      },
      {
        S: "VEHICLE",
      },
      {
        S: "WALKER",
      },
    ],
    Arenas: ["Ground"],
    Cost: "8",
    Power: "9",
    HP: "9",
    FrontText:
      "When this unit attacks and defeats a unit: You may deal the excess damage from this attack to an enemy ground unit.",
    DoubleSided: false,
    Rarity: "U",
    Unique: false,
    Artist: "Arthur Mougne",
    FrontArt: "https://d3alac64utt23z.cloudfront.net/images/cards/SOR/088.png",
  },
  {
    Set: "SOR",
    Number: "089",
    Name: "Relentless",
    Subtitle: "Konstantine's Folly",
    Type: "Unit",
    Aspects: [
      {
        S: "Command",
      },
      {
        S: "Villainy",
      },
    ],
    Traits: [
      {
        S: "IMPERIAL",
      },
      {
        S: "VEHICLE",
      },
      {
        S: "CAPITAL SHIP",
      },
    ],
    Arenas: ["Space"],
    Cost: "9",
    Power: "8",
    HP: "8",
    FrontText:
      "The first event played by each opponent each round loses all abilities.",
    DoubleSided: false,
    Rarity: "R",
    Unique: true,
    Artist: "Ross Taylor",
    FrontArt: "https://d3alac64utt23z.cloudfront.net/images/cards/SOR/089.png",
  },
  {
    Set: "SOR",
    Number: "092",
    Name: "Overwhelming Barrage",
    Type: "Event",
    Aspects: [
      {
        S: "Command",
      },
      {
        S: "Villainy",
      },
    ],
    Traits: [
      {
        S: "TACTIC",
      },
    ],
    Cost: "5",
    FrontText:
      "Give a friendly unit +2/+2 for this phase. Then, it deals damage equal to its power divided as you choose among any number of other units.",
    DoubleSided: false,
    Rarity: "U",
    Unique: false,
    Artist: "Francois Cannels",
    FrontArt: "https://d3alac64utt23z.cloudfront.net/images/cards/SOR/092.png",
  },
  {
    Set: "SOR",
    Number: "097",
    Name: "Admiral Ackbar",
    Subtitle: "Brilliant Strategist",
    Type: "Unit",
    Aspects: [
      {
        S: "Command",
      },
      {
        S: "Heroism",
      },
    ],
    Traits: [
      {
        S: "REBEL",
      },
      {
        S: "OFFICIAL",
      },
    ],
    Arenas: ["Ground"],
    Cost: "3",
    Power: "1",
    HP: "4",
    FrontText:
      "Restore 1 (When this unit attacks, heal 1 damage from your base.)\nWhen Played: You may deal damage to a unit equal to the number of units you control in its arena.",
    DoubleSided: false,
    Rarity: "R",
    Unique: true,
    Keywords: ["Restore"],
    Artist: "Luke Harrington",
    FrontArt: "https://d3alac64utt23z.cloudfront.net/images/cards/SOR/097.png",
  },
  {
    Set: "SOR",
    Number: "102",
    Name: "Home One",
    Subtitle: "Alliance Flagship",
    Type: "Unit",
    Aspects: [
      {
        S: "Command",
      },
      {
        S: "Heroism",
      },
    ],
    Traits: [
      {
        S: "REBEL",
      },
      {
        S: "VEHICLE",
      },
      {
        S: "CAPITAL SHIP",
      },
    ],
    Arenas: ["Space"],
    Cost: "8",
    Power: "7",
    HP: "7",
    FrontText:
      "Restore 2\nEach other friendly unit gains Restore 1.\nWhen Played: Play a Heroism unit from your discard pile. It costs 3 less.",
    DoubleSided: false,
    Rarity: "L",
    Unique: true,
    Keywords: ["Restore"],
    Artist: "Amélie Hutt",
    FrontArt: "https://d3alac64utt23z.cloudfront.net/images/cards/SOR/102.png",
  },
  {
    Set: "SOR",
    Number: "107",
    Name: "Command",
    Type: "Event",
    Aspects: [
      {
        S: "Command",
      },
      {
        S: "Command",
      },
    ],
    Traits: [
      {
        S: "INNATE",
      },
    ],
    Cost: "4",
    FrontText:
      "Choose two, in any order:\nGive 2 Experience tokens to a unit. \nA friendly unit deals damage equal to its power to a non-unique enemy unit. \nPut this event into play as a resource.\nReturn a unit from your discard pile to your hand.",
    DoubleSided: false,
    Rarity: "L",
    Unique: false,
    Artist: "Maxine Vee",
    FrontArt: "https://d3alac64utt23z.cloudfront.net/images/cards/SOR/107.png",
  },
  {
    Set: "SOR",
    Number: "109",
    Name: "Colonel Yularen",
    Subtitle: "ISB Director",
    Type: "Unit",
    Aspects: [
      {
        S: "Command",
      },
    ],
    Traits: [
      {
        S: "IMPERIAL",
      },
      {
        S: "OFFICIAL",
      },
    ],
    Arenas: ["Ground"],
    Cost: "2",
    Power: "2",
    HP: "3",
    FrontText:
      "When you play a Command unit (including this one): Heal 1 damage from your base.",
    DoubleSided: false,
    Rarity: "U",
    Unique: true,
    Artist: "David Buisan",
    FrontArt: "https://d3alac64utt23z.cloudfront.net/images/cards/SOR/109.png",
  },
  {
    Set: "SOR",
    Number: "112",
    Name: "Consortium StarViper",
    Type: "Unit",
    Aspects: [
      {
        S: "Command",
      },
    ],
    Traits: [
      {
        S: "FRINGE",
      },
      {
        S: "VEHICLE",
      },
      {
        S: "FIGHTER",
      },
    ],
    Arenas: ["Space"],
    Cost: "3",
    Power: "3",
    HP: "3",
    FrontText:
      "While you have the initiative, this unit gains RESTORE 2. (When this unit attacks, heal 2 damage from your base.)",
    DoubleSided: false,
    Rarity: "C",
    Unique: false,
    Keywords: ["Restore"],
    Artist: "Christian Papazoglakis",
    FrontArt: "https://d3alac64utt23z.cloudfront.net/images/cards/SOR/112.png",
  },
  {
    Set: "SOR",
    Number: "115",
    Name: "Agent Kallus",
    Subtitle: "Seeking the Rebels",
    Type: "Unit",
    Aspects: [
      {
        S: "Command",
      },
    ],
    Traits: [
      {
        S: "IMPERIAL",
      },
      {
        S: "TROOPER",
      },
    ],
    Arenas: ["Ground"],
    Cost: "5",
    Power: "4",
    HP: "4",
    FrontText:
      "AMBUSH (After you play this unit, he may ready and attack an enemy unit.)\nWhen another unique unit is defeated: You may draw a card. Use this ability only once each round.",
    DoubleSided: false,
    Rarity: "R",
    Unique: true,
    Keywords: ["Ambush"],
    Artist: "Omercan Cirit",
    FrontArt: "https://d3alac64utt23z.cloudfront.net/images/cards/SOR/115.png",
  },
  {
    Set: "SOR",
    Number: "121",
    Name: "Hardpoint Heavy Blaster",
    Type: "Upgrade",
    Aspects: [
      {
        S: "Command",
      },
    ],
    Traits: [
      {
        S: "MODIFICATION",
      },
      {
        S: "WEAPON",
      },
    ],
    Cost: "2",
    Power: "2",
    HP: "2",
    FrontText:
      "Attach to a VEHICLE unit.\nAttached unit gains: \"On Attack: If this unit isn't attacking a base, you may deal 2 damage to a unit in the defender's arena.\"",
    DoubleSided: false,
    Rarity: "U",
    Unique: false,
    Artist: "Arthur Mougne",
    FrontArt: "https://d3alac64utt23z.cloudfront.net/images/cards/SOR/121.png",
  },
  {
    Set: "SOR",
    Number: "123",
    Name: "Recruit",
    Type: "Event",
    Aspects: [
      {
        S: "Command",
      },
    ],
    Traits: [
      {
        S: "SUPPLY",
      },
    ],
    Cost: "1",
    FrontText:
      "Search the top 5 cards of your deck for a unit, reveal it, and draw it. (Put the other cards on the bottom of your deck in a random order.)",
    DoubleSided: false,
    Rarity: "C",
    Unique: false,
    Artist: "Borja Pindado",
    FrontArt: "https://d3alac64utt23z.cloudfront.net/images/cards/SOR/123.png",
  },
  {
    Set: "SOR",
    Number: "124",
    Name: "Tactical Advantage",
    Type: "Event",
    Aspects: [
      {
        S: "Command",
      },
    ],
    Traits: [
      {
        S: "TACTIC",
      },
    ],
    Cost: "1",
    FrontText: "Give a unit +2/+2 for this phase.",
    DoubleSided: false,
    Rarity: "C",
    Unique: false,
    Artist: "Eslam Aboshady",
    FrontArt: "https://d3alac64utt23z.cloudfront.net/images/cards/SOR/124.png",
  },
  {
    Set: "SOR",
    Number: "125",
    Name: "Prepare For Takeoff",
    Type: "Event",
    Aspects: [
      {
        S: "Command",
      },
    ],
    Traits: [
      {
        S: "PLAN",
      },
    ],
    Cost: "2",
    FrontText:
      "Search the top 8 cards of your deck for up to 2 VEHICLE units, reveal them, and draw them. (Put the other cards on the bottom of your deck in a random order.)",
    DoubleSided: false,
    Rarity: "U",
    Unique: false,
    Artist: "Ario Murti",
    FrontArt: "https://d3alac64utt23z.cloudfront.net/images/cards/SOR/125.png",
  },
  {
    Set: "SOR",
    Number: "126",
    Name: "Resupply",
    Type: "Event",
    Aspects: [
      {
        S: "Command",
      },
    ],
    Traits: [
      {
        S: "SUPPLY",
      },
    ],
    Cost: "3",
    FrontText: "Put this event into play as a resource.",
    DoubleSided: false,
    Rarity: "C",
    Unique: false,
    Artist: "Robynn Frauhn",
    FrontArt: "https://d3alac64utt23z.cloudfront.net/images/cards/SOR/126.png",
  },
  {
    Set: "SOR",
    Number: "128",
    Name: "Death Star Stormtrooper",
    Type: "Unit",
    Aspects: [
      {
        S: "Aggression",
      },
      {
        S: "Villainy",
      },
    ],
    Traits: [
      {
        S: "IMPERIAL",
      },
      {
        S: "TROOPER",
      },
    ],
    Arenas: ["Ground"],
    Cost: "1",
    Power: "3",
    HP: "1",
    DoubleSided: false,
    Rarity: "C",
    Unique: false,
    Artist: "Ario Murti",
    FrontArt: "https://d3alac64utt23z.cloudfront.net/images/cards/SOR/128.png",
  },
  {
    Set: "SOR",
    Number: "129",
    Name: "Admiral Ozzel",
    Subtitle: "Overconfident",
    Type: "Unit",
    Aspects: [
      {
        S: "Aggression",
      },
      {
        S: "Villainy",
      },
    ],
    Traits: [
      {
        S: "IMPERIAL",
      },
      {
        S: "OFFICIAL",
      },
    ],
    Arenas: ["Ground"],
    Cost: "2",
    Power: "2",
    HP: "3",
    FrontText:
      "Action [{exhaust}]: Play an IMPERIAL unit from your hand (paying its cost). It enters play ready. Each opponent may ready a unit.",
    DoubleSided: false,
    Rarity: "U",
    Unique: true,
    Artist: "Yvette Chua",
    FrontArt: "https://d3alac64utt23z.cloudfront.net/images/cards/SOR/129.png",
  },
  {
    Set: "SOR",
    Number: "130",
    Name: "First Legion Snowtrooper",
    Type: "Unit",
    Aspects: [
      {
        S: "Aggression",
      },
      {
        S: "Villainy",
      },
    ],
    Traits: [
      {
        S: "IMPERIAL",
      },
      {
        S: "TROOPER",
      },
    ],
    Arenas: ["Ground"],
    Cost: "2",
    Power: "2",
    HP: "3",
    FrontText:
      "While attacking a damaged unit, this unit gets +2/+0 and gains Overwhelm. (Deal excess damage to the opponent's base.)",
    DoubleSided: false,
    Rarity: "C",
    Unique: false,
    Keywords: ["Overwhelm"],
    Artist: "Milos Slavkovic",
    FrontArt: "https://d3alac64utt23z.cloudfront.net/images/cards/SOR/130.png",
  },
  {
    Set: "SOR",
    Number: "132",
    Name: "Imperial Interceptor",
    Type: "Unit",
    Aspects: [
      {
        S: "Aggression",
      },
      {
        S: "Villainy",
      },
    ],
    Traits: [
      {
        S: "IMPERIAL",
      },
      {
        S: "VEHICLE",
      },
      {
        S: "FIGHTER",
      },
    ],
    Arenas: ["Space"],
    Cost: "4",
    Power: "3",
    HP: "2",
    FrontText: "When Played: You may deal 3 damage to a space unit.",
    DoubleSided: false,
    Rarity: "C",
    Unique: false,
    Artist: "Francois Cannels",
    FrontArt: "https://d3alac64utt23z.cloudfront.net/images/cards/SOR/132.png",
  },
  {
    Set: "SOR",
    Number: "135",
    Name: "Emperor Palpatine",
    Subtitle: "Master of the Dark Side",
    Type: "Unit",
    Aspects: [
      {
        S: "Aggression",
      },
      {
        S: "Villainy",
      },
    ],
    Traits: [
      {
        S: "FORCE",
      },
      {
        S: "IMPERIAL",
      },
      {
        S: "SITH",
      },
      {
        S: "OFFICIAL",
      },
    ],
    Arenas: ["Ground"],
    Cost: "8",
    Power: "6",
    HP: "6",
    FrontText:
      "Overwhelm (When attacking an enemy unit, deal excess damage to the opponent's base.) \nWhen Played: Deal 6 damage divided as you choose among enemy units.",
    DoubleSided: false,
    Rarity: "R",
    Unique: true,
    Keywords: ["Overwhelm"],
    Artist: "Didier Nguyen",
    FrontArt: "https://d3alac64utt23z.cloudfront.net/images/cards/SOR/135.png",
  },
  {
    Set: "SOR",
    Number: "136",
    Name: "Vader's Lightsaber",
    Type: "Upgrade",
    Aspects: [
      {
        S: "Aggression",
      },
      {
        S: "Villainy",
      },
    ],
    Traits: [
      {
        S: "ITEM",
      },
      {
        S: "WEAPON",
      },
      {
        S: "LIGHTSABER",
      },
    ],
    Cost: "2",
    Power: "3",
    HP: "1",
    FrontText:
      "Attach to a non-VEHICLE unit.\nWhen Played: If attached unit is Darth Vader, you may deal 4 damage to a ground unit.",
    DoubleSided: false,
    Rarity: "S",
    Unique: true,
    Artist: "Arthur Mougne",
    FrontArt: "https://d3alac64utt23z.cloudfront.net/images/cards/SOR/136.png",
  },
  {
    Set: "SOR",
    Number: "139",
    Name: "Force Choke",
    Type: "Event",
    Aspects: [
      {
        S: "Aggression",
      },
      {
        S: "Villainy",
      },
    ],
    Traits: [
      {
        S: "FORCE",
      },
    ],
    Cost: "2",
    FrontText:
      "If you control a FORCE unit, this event costs {C=1} less to play.\nDeal 5 damage to a non-VEHICLE unit. That unit's controller draws a card.",
    DoubleSided: false,
    Rarity: "U",
    Unique: false,
    Artist: "Stefano Landini",
    FrontArt: "https://d3alac64utt23z.cloudfront.net/images/cards/SOR/139.png",
  },
  {
    Set: "SOR",
    Number: "142",
    Name: "Sabine Wren",
    Subtitle: "Explosives Artist",
    Type: "Unit",
    Aspects: [
      {
        S: "Aggression",
      },
      {
        S: "Heroism",
      },
    ],
    Traits: [
      {
        S: "MANDALORIAN",
      },
      {
        S: "REBEL",
      },
      {
        S: "SPECTRE",
      },
    ],
    Arenas: ["Ground"],
    Cost: "2",
    Power: "2",
    HP: "3",
    FrontText:
      "While there are at least 3 aspects among other friendly units, this unit can't be attacked (unless she gains Sentinel). \nOn Attack: You may deal 1 damage to the defender or to a base.",
    DoubleSided: false,
    Rarity: "U",
    Unique: true,
    Artist: "Rebecca Farrow",
    FrontArt: "https://d3alac64utt23z.cloudfront.net/images/cards/SOR/142.png",
  },
  {
    Set: "SOR",
    Number: "149",
    Name: "Mace Windu",
    Subtitle: "Party Crasher",
    Type: "Unit",
    Aspects: [
      {
        S: "Aggression",
      },
      {
        S: "Heroism",
      },
    ],
    Traits: [
      {
        S: "FORCE",
      },
      {
        S: "JEDI",
      },
      {
        S: "REPUBLIC",
      },
    ],
    Arenas: ["Ground"],
    Cost: "7",
    Power: "5",
    HP: "7",
    FrontText: "Ambush\nWhen this unit attacks and defeats a unit: Ready him.",
    DoubleSided: false,
    Rarity: "L",
    Unique: true,
    Keywords: ["Ambush"],
    Artist: "Sandra Chlewińska",
    FrontArt: "https://d3alac64utt23z.cloudfront.net/images/cards/SOR/149.png",
  },
  {
    Set: "SOR",
    Number: "163",
    Name: "Star Wing Scout",
    Type: "Unit",
    Aspects: [
      {
        S: "Aggression",
      },
    ],
    Traits: [
      {
        S: "VEHICLE",
      },
      {
        S: "FIGHTER",
      },
    ],
    Arenas: ["Space"],
    Cost: "3",
    Power: "4",
    HP: "1",
    FrontText: "When Defeated: If you have the initiative, draw 2 cards.",
    DoubleSided: false,
    Rarity: "U",
    Unique: false,
    Artist: "Fernando Correa",
    FrontArt: "https://d3alac64utt23z.cloudfront.net/images/cards/SOR/163.png",
  },
  {
    Set: "SOR",
    Number: "172",
    Name: "Open Fire",
    Type: "Event",
    Aspects: [
      {
        S: "Aggression",
      },
    ],
    Traits: [
      {
        S: "TACTIC",
      },
    ],
    Cost: "3",
    FrontText: "Deal 4 damage to a unit.",
    DoubleSided: false,
    Rarity: "C",
    Unique: false,
    Artist: "Fernando Correa",
    FrontArt: "https://d3alac64utt23z.cloudfront.net/images/cards/SOR/172.png",
  },
  {
    Set: "SOR",
    Number: "179",
    Name: "Boba Fett",
    Subtitle: "Disintegrator",
    Type: "Unit",
    Aspects: [
      {
        S: "Cunning",
      },
      {
        S: "Villainy",
      },
    ],
    Traits: [
      {
        S: "UNDERWORLD",
      },
      {
        S: "BOUNTY HUNTER",
      },
    ],
    Arenas: ["Ground"],
    Cost: "3",
    Power: "3",
    HP: "5",
    FrontText:
      "On Attack: If this unit is attacking an exhausted unit that didn't enter play this round, deal 3 damage to the defender.",
    DoubleSided: false,
    Rarity: "L",
    Unique: true,
    Artist: "French Carlomagno",
    FrontArt: "https://d3alac64utt23z.cloudfront.net/images/cards/SOR/179.png",
  },
  {
    Set: "SOR",
    Number: "184",
    Name: "Fett's Firespray",
    Subtitle: "Pursuing the Bounty",
    Type: "Unit",
    Aspects: [
      {
        S: "Cunning",
      },
      {
        S: "Villainy",
      },
    ],
    Traits: [
      {
        S: "UNDERWORLD",
      },
      {
        S: "VEHICLE",
      },
      {
        S: "TRANSPORT",
      },
    ],
    Arenas: ["Space"],
    Cost: "6",
    Power: "5",
    HP: "6",
    FrontText:
      "When Played: If you control Boba Fett or Jango Fett (as a leader or unit), ready this unit.\nAction [{c=2}]: Exhaust a non-unique unit.",
    DoubleSided: false,
    Rarity: "R",
    Unique: true,
    Artist: "André Mealha",
    FrontArt: "https://d3alac64utt23z.cloudfront.net/images/cards/SOR/184.png",
  },
  {
    Set: "SOR",
    Number: "189",
    Name: "Leia Organa",
    Subtitle: "Defiant Princess",
    Type: "Unit",
    Aspects: [
      {
        S: "Cunning",
      },
      {
        S: "Heroism",
      },
    ],
    Traits: [
      {
        S: "REBEL",
      },
      {
        S: "OFFICIAL",
      },
    ],
    Arenas: ["Ground"],
    Cost: "2",
    Power: "2",
    HP: "2",
    FrontText: "When Played: Either ready a resource or exhaust a unit.",
    DoubleSided: false,
    Rarity: "S",
    Unique: true,
    Artist: "Robynn Frauhn",
    FrontArt: "https://d3alac64utt23z.cloudfront.net/images/cards/SOR/189.png",
  },
  {
    Set: "SOR",
    Number: "192",
    Name: "Ezra Bridger",
    Subtitle: "Resourceful Troublemaker",
    Type: "Unit",
    Aspects: [
      {
        S: "Cunning",
      },
      {
        S: "Heroism",
      },
    ],
    Traits: [
      {
        S: "FORCE",
      },
      {
        S: "REBEL",
      },
      {
        S: "SPECTRE",
      },
    ],
    Arenas: ["Ground"],
    Cost: "3",
    Power: "3",
    HP: "4",
    FrontText:
      "When this unit completes an attack: Look at the top card of your deck. You may play it, discard it, or leave it on top of your deck.",
    DoubleSided: false,
    Rarity: "U",
    Unique: true,
    Artist: "Joshua Carson",
    FrontArt: "https://d3alac64utt23z.cloudfront.net/images/cards/SOR/192.png",
  },
  {
    Set: "SOR",
    Number: "194",
    Name: "Rogue Operative",
    Type: "Unit",
    Aspects: [
      {
        S: "Cunning",
      },
      {
        S: "Heroism",
      },
    ],
    Traits: [
      {
        S: "REBEL",
      },
      {
        S: "TROOPER",
      },
    ],
    Arenas: ["Ground"],
    Cost: "3",
    Power: "2",
    HP: "4",
    FrontText:
      "Saboteur (When this unit attacks, ignore Sentinel and defeat the defender's Shields.)\nRaid 2 (This unit gets +2/+0 while attacking.)",
    DoubleSided: false,
    Rarity: "C",
    Unique: false,
    Keywords: ["Raid", "Saboteur"],
    Artist: "Steve Morris",
    FrontArt: "https://d3alac64utt23z.cloudfront.net/images/cards/SOR/194.png",
  },
  {
    Set: "SOR",
    Number: "195",
    Name: "Auzituck Liberator Gunship",
    Type: "Unit",
    Aspects: [
      {
        S: "Cunning",
      },
      {
        S: "Heroism",
      },
    ],
    Traits: [
      {
        S: "VEHICLE",
      },
      {
        S: "FIGHTER",
      },
    ],
    Arenas: ["Space"],
    Cost: "4",
    Power: "3",
    HP: "4",
    FrontText:
      "Ambush (After you play this unit, it may ready and attack an enemy unit.)",
    DoubleSided: false,
    Rarity: "C",
    Unique: false,
    Keywords: ["Ambush"],
    Artist: "Mark Zhang",
    FrontArt: "https://d3alac64utt23z.cloudfront.net/images/cards/SOR/195.png",
  },
  {
    Set: "SOR",
    Number: "196",
    Name: "Chewbacca",
    Subtitle: "Loyal Companion",
    Type: "Unit",
    Aspects: [
      {
        S: "Cunning",
      },
      {
        S: "Heroism",
      },
    ],
    Traits: [
      {
        S: "UNDERWORLD",
      },
      {
        S: "WOOKIEE",
      },
    ],
    Arenas: ["Ground"],
    Cost: "5",
    Power: "3",
    HP: "6",
    FrontText:
      "Sentinel (Units in this arena can't attack your non-Sentinel units or your base.)\nWhen this unit is attacked: Ready him.",
    DoubleSided: false,
    Rarity: "U",
    Unique: true,
    Keywords: ["Sentinel"],
    Artist: "Luke Harrington",
    FrontArt: "https://d3alac64utt23z.cloudfront.net/images/cards/SOR/196.png",
  },
  {
    Set: "SOR",
    Number: "198",
    Name: "Han Solo",
    Subtitle: "Reluctant Hero",
    Type: "Unit",
    Aspects: [
      {
        S: "Cunning",
      },
      {
        S: "Heroism",
      },
    ],
    Traits: [
      {
        S: "UNDERWORLD",
      },
    ],
    Arenas: ["Ground"],
    Cost: "7",
    Power: "6",
    HP: "6",
    FrontText:
      "Ambush (After you play this unit, he may ready and attack an enemy unit.) \nWhile attacking, this unit deals combat damage before the defender.",
    DoubleSided: false,
    Rarity: "R",
    Unique: true,
    Keywords: ["Ambush"],
    Artist: "Borja Pindado",
    FrontArt: "https://d3alac64utt23z.cloudfront.net/images/cards/SOR/198.png",
  },
  {
    Set: "SOR",
    Number: "217",
    Name: "Shoot First",
    Type: "Event",
    Aspects: [
      {
        S: "Cunning",
      },
    ],
    Traits: [
      {
        S: "TRICK",
      },
    ],
    Cost: "1",
    FrontText:
      "Attack with a unit. It gets +1/+0 for this attack and deals its combat damage before the defender. (If the defender is defeated, it deals no combat damage.)",
    DoubleSided: false,
    Rarity: "U",
    Unique: false,
    Artist: "Ario Murti",
    FrontArt: "https://d3alac64utt23z.cloudfront.net/images/cards/SOR/217.png",
  },
  {
    Set: "SOR",
    Number: "218",
    Name: "Asteroid Sanctuary",
    Type: "Event",
    Aspects: [
      {
        S: "Cunning",
      },
    ],
    Traits: [
      {
        S: "TRICK",
      },
    ],
    Cost: "2",
    FrontText:
      "Exhaust an enemy unit.\nGive a Shield token to a friendly unit that costs 3 or less.",
    DoubleSided: false,
    Rarity: "C",
    Unique: false,
    Artist: "Rebecca Farrow",
    FrontArt: "https://d3alac64utt23z.cloudfront.net/images/cards/SOR/218.png",
  },
  {
    Set: "SOR",
    Number: "220",
    Name: "Surprise Strike",
    Type: "Event",
    Aspects: [
      {
        S: "Cunning",
      },
    ],
    Traits: [
      {
        S: "TACTIC",
      },
    ],
    Cost: "2",
    FrontText: "Attack with a unit. It gets +3/+0 for this attack.",
    DoubleSided: false,
    Rarity: "C",
    Unique: false,
    Artist: "Ario Murti",
    FrontArt: "https://d3alac64utt23z.cloudfront.net/images/cards/SOR/220.png",
  },
  {
    Set: "SOR",
    Number: "222",
    Name: "Waylay",
    Type: "Event",
    Aspects: [
      {
        S: "Cunning",
      },
    ],
    Traits: [
      {
        S: "TRICK",
      },
    ],
    Cost: "3",
    FrontText: "Return a non-leader unit to its owner's hand.",
    DoubleSided: false,
    Rarity: "C",
    Unique: false,
    Artist: "Amélie Hutt",
    FrontArt: "https://d3alac64utt23z.cloudfront.net/images/cards/SOR/222.png",
  },
  {
    Set: "SOR",
    Number: "225",
    Name: "TIE/Ln Fighter",
    Type: "Unit",
    Aspects: [
      {
        S: "Villainy",
      },
    ],
    Traits: [
      {
        S: "IMPERIAL",
      },
      {
        S: "VEHICLE",
      },
      {
        S: "FIGHTER",
      },
    ],
    Arenas: ["Space"],
    Cost: "1",
    Power: "2",
    HP: "1",
    DoubleSided: false,
    Rarity: "C",
    Unique: false,
    Artist: "French Carlomagno",
    FrontArt: "https://d3alac64utt23z.cloudfront.net/images/cards/SOR/225.png",
  },
  {
    Set: "SOR",
    Number: "226",
    Name: "Admiral Motti",
    Subtitle: "Brazen and Scornful",
    Type: "Unit",
    Aspects: [
      {
        S: "Villainy",
      },
    ],
    Traits: [
      {
        S: "IMPERIAL",
      },
      {
        S: "OFFICIAL",
      },
    ],
    Arenas: ["Ground"],
    Cost: "2",
    Power: "1",
    HP: "1",
    FrontText: "When Defeated: You may ready a Villainy unit.",
    DoubleSided: false,
    Rarity: "S",
    Unique: true,
    Artist: "Tomas Oleksak",
    FrontArt: "https://d3alac64utt23z.cloudfront.net/images/cards/SOR/226.png",
  },
  {
    Set: "SOR",
    Number: "227",
    Name: "Snowtrooper Lieutenant",
    Type: "Unit",
    Aspects: [
      {
        S: "Villainy",
      },
    ],
    Traits: [
      {
        S: "IMPERIAL",
      },
      {
        S: "TROOPER",
      },
    ],
    Arenas: ["Ground"],
    Cost: "2",
    Power: "2",
    HP: "2",
    FrontText:
      "When Played: You may attack with a unit. If it's an IMPERIAL unit, it gets +2/+0 for this attack.",
    DoubleSided: false,
    Rarity: "C",
    Unique: false,
    Artist: "Erik Ly",
    FrontArt: "https://d3alac64utt23z.cloudfront.net/images/cards/SOR/227.png",
  },
  {
    Set: "SOR",
    Number: "228",
    Name: "Viper Probe Droid",
    Type: "Unit",
    Aspects: [
      {
        S: "Villainy",
      },
    ],
    Traits: [
      {
        S: "IMPERIAL",
      },
      {
        S: "DROID",
      },
    ],
    Arenas: ["Ground"],
    Cost: "2",
    Power: "3",
    HP: "2",
    FrontText: "When Played: Look at an opponent's hand.",
    DoubleSided: false,
    Rarity: "C",
    Unique: false,
    Artist: "Amad Mir",
    FrontArt: "https://d3alac64utt23z.cloudfront.net/images/cards/SOR/228.png",
  },
  {
    Set: "SOR",
    Number: "229",
    Name: "Cell Block Guard",
    Type: "Unit",
    Aspects: [
      {
        S: "Villainy",
      },
    ],
    Traits: [
      {
        S: "IMPERIAL",
      },
      {
        S: "TROOPER",
      },
    ],
    Arenas: ["Ground"],
    Cost: "3",
    Power: "3",
    HP: "3",
    FrontText:
      "Sentinel (Units in this arena can't attack your non-Sentinel units or your base.)",
    DoubleSided: false,
    Rarity: "C",
    Unique: false,
    Keywords: ["Sentinel"],
    Artist: "French Carlomagno",
    FrontArt: "https://d3alac64utt23z.cloudfront.net/images/cards/SOR/229.png",
  },
  {
    Set: "SOR",
    Number: "230",
    Name: "General Veers",
    Subtitle: "Blizzard Force Commander",
    Type: "Unit",
    Aspects: [
      {
        S: "Villainy",
      },
    ],
    Traits: [
      {
        S: "IMPERIAL",
      },
      {
        S: "OFFICIAL",
      },
    ],
    Arenas: ["Ground"],
    Cost: "3",
    Power: "3",
    HP: "3",
    FrontText: "Other friendly IMPERIAL units get +1/+1.",
    DoubleSided: false,
    Rarity: "U",
    Unique: true,
    Artist: "Steve Morris",
    FrontArt: "https://d3alac64utt23z.cloudfront.net/images/cards/SOR/230.png",
  },
  {
    Set: "SOR",
    Number: "231",
    Name: "TIE Advanced",
    Type: "Unit",
    Aspects: [
      {
        S: "Villainy",
      },
    ],
    Traits: [
      {
        S: "IMPERIAL",
      },
      {
        S: "VEHICLE",
      },
      {
        S: "FIGHTER",
      },
    ],
    Arenas: ["Space"],
    Cost: "4",
    Power: "3",
    HP: "2",
    FrontText:
      "When Played: Give 2 Experience tokens to another friendly IMPERIAL unit.",
    DoubleSided: false,
    Rarity: "U",
    Unique: false,
    Artist: "Eslam Aboshady",
    FrontArt: "https://d3alac64utt23z.cloudfront.net/images/cards/SOR/231.png",
  },
  {
    Set: "SOR",
    Number: "232",
    Name: "AT-ST",
    Type: "Unit",
    Aspects: [
      {
        S: "Villainy",
      },
    ],
    Traits: [
      {
        S: "IMPERIAL",
      },
      {
        S: "VEHICLE",
      },
      {
        S: "WALKER",
      },
    ],
    Arenas: ["Ground"],
    Cost: "6",
    Power: "6",
    HP: "7",
    FrontText:
      "Overwhelm (When attacking an enemy unit, deal excess damage to the opponent's base.)",
    DoubleSided: false,
    Rarity: "C",
    Unique: false,
    Keywords: ["Overwhelm"],
    Artist: "Stephen Zavala",
    FrontArt: "https://d3alac64utt23z.cloudfront.net/images/cards/SOR/232.png",
  },
  {
    Set: "SOR",
    Number: "233",
    Name: "I Am Your Father",
    Type: "Event",
    Aspects: [
      {
        S: "Villainy",
      },
    ],
    Traits: [
      {
        S: "GAMBIT",
      },
    ],
    Cost: "3",
    FrontText:
      'Deal 7 Damage to an enemy unit unless its controller says "no." If they do, draw 3 cards.',
    DoubleSided: false,
    Rarity: "S",
    Unique: false,
    Artist: "Stefano Landini",
    FrontArt: "https://d3alac64utt23z.cloudfront.net/images/cards/SOR/233.png",
  },
  {
    Set: "SOR",
    Number: "234",
    Name: "Maximum Firepower",
    Type: "Event",
    Aspects: [
      {
        S: "Villainy",
      },
    ],
    Traits: [
      {
        S: "IMPERIAL",
      },
      {
        S: "TACTIC",
      },
    ],
    Cost: "4",
    FrontText:
      "A friendly IMPERIAL unit deals damage equal to its power to a unit.\nThen, another friendly IMPERIAL unit deals damage equal to its power to the same unit.",
    DoubleSided: false,
    Rarity: "C",
    Unique: false,
    Artist: "Stephen Zavala",
    FrontArt: "https://d3alac64utt23z.cloudfront.net/images/cards/SOR/234.png",
  },
  {
    Set: "SOR",
    Number: "235",
    Name: "Galactic Ambition",
    Type: "Event",
    Aspects: [
      {
        S: "Villainy",
      },
    ],
    Traits: [
      {
        S: "INNATE",
      },
    ],
    Cost: "7",
    FrontText:
      "Play a non-Heroism unit from your hand for free. Deal damage to your base equal to its cost.",
    DoubleSided: false,
    Rarity: "R",
    Unique: false,
    Artist: "André Mealha",
    FrontArt: "https://d3alac64utt23z.cloudfront.net/images/cards/SOR/235.png",
  },
  {
    Set: "SOR",
    Number: "236",
    Name: "R2-D2",
    Subtitle: "Ignoring Protocol",
    Type: "Unit",
    Aspects: [
      {
        S: "Heroism",
      },
    ],
    Traits: [
      {
        S: "REBEL",
      },
      {
        S: "DROID",
      },
    ],
    Arenas: ["Ground"],
    Cost: "1",
    Power: "1",
    HP: "4",
    FrontText:
      "When Played/On Attack: Look at the top card of your deck. You may put it on the bottom of your deck. (Otherwise, leave it on top of your deck.)",
    DoubleSided: false,
    Rarity: "S",
    Unique: true,
    Artist: "Aitor Prieto",
    FrontArt: "https://d3alac64utt23z.cloudfront.net/images/cards/SOR/236.png",
  },
  {
    Set: "SOR",
    Number: "237",
    Name: "Alliance X-Wing",
    Type: "Unit",
    Aspects: [
      {
        S: "Heroism",
      },
    ],
    Traits: [
      {
        S: "REBEL",
      },
      {
        S: "VEHICLE",
      },
      {
        S: "FIGHTER",
      },
    ],
    Arenas: ["Space"],
    Cost: "2",
    Power: "2",
    HP: "3",
    DoubleSided: false,
    Rarity: "C",
    Unique: false,
    Artist: "Francois Cannels",
    FrontArt: "https://d3alac64utt23z.cloudfront.net/images/cards/SOR/237.png",
  },
  {
    Set: "SOR",
    Number: "238",
    Name: "C-3P0",
    Subtitle: "Protocol Droid",
    Type: "Unit",
    Aspects: [
      {
        S: "Heroism",
      },
    ],
    Traits: [
      {
        S: "REBEL",
      },
      {
        S: "DROID",
      },
    ],
    Arenas: ["Ground"],
    Cost: "2",
    Power: "1",
    HP: "4",
    FrontText:
      "When Played/On Attack: Choose a number, then look at the top card of your deck. If its cost is the chosen number, you may reveal and draw it. (Otherwise, leave it on top of your deck.)",
    DoubleSided: false,
    Rarity: "S",
    Unique: true,
    Artist: "Ash Pierce",
    FrontArt: "https://d3alac64utt23z.cloudfront.net/images/cards/SOR/238.png",
  },
  {
    Set: "SOR",
    Number: "239",
    Name: "Rebel Pathfinder",
    Type: "Unit",
    Aspects: [
      {
        S: "Heroism",
      },
    ],
    Traits: [
      {
        S: "REBEL",
      },
      {
        S: "TROOPER",
      },
    ],
    Arenas: ["Ground"],
    Cost: "2",
    Power: "2",
    HP: "3",
    FrontText:
      "Saboteur (When this unit attacks, ignore Sentinel and defeat the defender's Shields.)",
    DoubleSided: false,
    Rarity: "C",
    Unique: false,
    Keywords: ["Saboteur"],
    Artist: "Joshua Carson",
    FrontArt: "https://d3alac64utt23z.cloudfront.net/images/cards/SOR/239.png",
  },
  {
    Set: "SOR",
    Number: "240",
    Name: "Fleet Lieutenant",
    Type: "Unit",
    Aspects: [
      {
        S: "Heroism",
      },
    ],
    Traits: [
      {
        S: "REBEL",
      },
      {
        S: "TROOPER",
      },
    ],
    Arenas: ["Ground"],
    Cost: "3",
    Power: "3",
    HP: "3",
    FrontText:
      "When Played: You may attack with a unit. If it's a REBEL unit, it gets +2/+0 for this attack.",
    DoubleSided: false,
    Rarity: "C",
    Unique: false,
    Artist: "Hoan Nguyen",
    FrontArt: "https://d3alac64utt23z.cloudfront.net/images/cards/SOR/240.png",
  },
  {
    Set: "SOR",
    Number: "241",
    Name: "Wing Leader",
    Type: "Unit",
    Aspects: [
      {
        S: "Heroism",
      },
    ],
    Traits: [
      {
        S: "REBEL",
      },
      {
        S: "VEHICLE",
      },
      {
        S: "FIGHTER",
      },
    ],
    Arenas: ["Space"],
    Cost: "3",
    Power: "2",
    HP: "1",
    FrontText:
      "When Played: Give 2 Experience tokens to another friendly REBEL unit.",
    DoubleSided: false,
    Rarity: "U",
    Unique: false,
    Artist: "French Carlomagno",
    FrontArt: "https://d3alac64utt23z.cloudfront.net/images/cards/SOR/241.png",
  },
  {
    Set: "SOR",
    Number: "242",
    Name: "General Dodonna",
    Subtitle: "Massassi Group Commander",
    Type: "Unit",
    Aspects: [
      {
        S: "Heroism",
      },
    ],
    Traits: [
      {
        S: "REBEL",
      },
      {
        S: "OFFICIAL",
      },
    ],
    Arenas: ["Ground"],
    Cost: "4",
    Power: "4",
    HP: "4",
    FrontText: "Other friendly REBEL units get +1/+1.",
    DoubleSided: false,
    Rarity: "U",
    Unique: true,
    Artist: "Steve Morris",
    FrontArt: "https://d3alac64utt23z.cloudfront.net/images/cards/SOR/242.png",
  },
  {
    Set: "SOR",
    Number: "244",
    Name: "Snowspeeder",
    Type: "Unit",
    Aspects: [
      {
        S: "Heroism",
      },
    ],
    Traits: [
      {
        S: "REBEL",
      },
      {
        S: "VEHICLE",
      },
      {
        S: "SPEEDER",
      },
    ],
    Arenas: ["Ground"],
    Cost: "5",
    Power: "3",
    HP: "6",
    FrontText:
      "Ambush (After you play this unit, it may ready and attack an enemy unit.) \nOn Attack: Exhaust an enemy VEHICLE ground unit.",
    DoubleSided: false,
    Rarity: "C",
    Unique: false,
    Keywords: ["Ambush"],
    Artist: "Fernando Correa",
    FrontArt: "https://d3alac64utt23z.cloudfront.net/images/cards/SOR/244.png",
  },
  {
    Set: "SOR",
    Number: "246",
    Name: "You're My Only Hope",
    Type: "Event",
    Aspects: [
      {
        S: "Heroism",
      },
    ],
    Traits: [
      {
        S: "GAMBIT",
      },
    ],
    Cost: "3",
    FrontText:
      "Look at the top card of your deck. You may play it. It costs 5 less. If your base has 5 or less remaining HP, you may play it for free instead.",
    DoubleSided: false,
    Rarity: "R",
    Unique: false,
    Artist: "Gretel Lusky",
    FrontArt: "https://d3alac64utt23z.cloudfront.net/images/cards/SOR/246.png",
  },
];
