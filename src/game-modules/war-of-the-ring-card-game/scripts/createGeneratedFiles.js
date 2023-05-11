const mkdirp = require("mkdirp");
const fs = require("fs");
const util = require("util");

const readdir = util.promisify(fs.readdir);
const readfile = util.promisify(fs.readFile);
const writefile = util.promisify(fs.writeFile);

const packsInputFolder =
  "./src/game-modules/war-of-the-ring-card-game/jsonMetadata/packs";
const scenariosInputFolder =
  "./src/game-modules/war-of-the-ring-card-game/jsonMetadata/scenarios";
const outputScenarioDir = "./public/json_data/scenarios";
const outputDirLoadFile =
  "./src/game-modules/war-of-the-ring-card-game/generated";
const outputLoadFile = `${outputDirLoadFile}/scenarioList_wotr.ts`;

const baseImgUrl = "https://ik.imagekit.io/cardtable/war_of_the_ring_card_game";

const DeckToMetadataMap = {
  Dúnedain: {
    imagePath: "/free_people_player_cards/",
    scenarioDeck: "free_people",
    sizeType: "standard",
  },
  Dwarf: {
    imagePath: "/free_people_player_cards/",
    scenarioDeck: "free_people",
    sizeType: "standard",
  },
  Elf: {
    imagePath: "/free_people_player_cards/",
    scenarioDeck: "free_people",
    sizeType: "standard",
  },
  Hobbit: {
    imagePath: "/free_people_player_cards/",
    scenarioDeck: "free_people",
    sizeType: "standard",
  },
  Rohan: {
    imagePath: "/free_people_player_cards/",
    scenarioDeck: "free_people",
    sizeType: "standard",
  },
  Wizard: {
    imagePath: "/free_people_player_cards/",
    scenarioDeck: "free_people",
    sizeType: "standard",
  },
  Isengard: {
    imagePath: "/shadow_player_cards/",
    scenarioDeck: "shadow",
    sizeType: "standard",
  },
  Monstrous: {
    imagePath: "/shadow_player_cards/",
    scenarioDeck: "shadow",
    sizeType: "standard",
  },
  Mordor: {
    imagePath: "/shadow_player_cards/",
    scenarioDeck: "shadow",
    sizeType: "standard",
  },
  Southron: {
    imagePath: "/shadow_player_cards/",
    scenarioDeck: "shadow",
    sizeType: "standard",
  },
  "Shadow Strongholds": {
    imagePath: "/shadow_strongholds/",
    scenarioDeck: "strongholds",
    sizeType: "tarot",
  },
  "Free People Strongholds": {
    imagePath: "/free_people_strongholds/",
    scenarioDeck: "strongholds",
    sizeType: "tarot",
  },
  Path1: {
    imagePath: "/Path1/",
    scenarioDeck: "path",
    sizeType: "tarot",
  },
  Path2: {
    imagePath: "/Path2/",
    scenarioDeck: "path",
    sizeType: "tarot",
  },
  Path3: {
    imagePath: "/Path3/",
    scenarioDeck: "path",
    sizeType: "tarot",
  },
  Path4: {
    imagePath: "/Path4/",
    scenarioDeck: "path",
    sizeType: "tarot",
  },
  Path5: {
    imagePath: "/Path5/",
    scenarioDeck: "path",
    sizeType: "tarot",
  },
  Path6: {
    imagePath: "/Path6/",
    scenarioDeck: "path",
    sizeType: "tarot",
  },
  Path7: {
    imagePath: "/Path7/",
    scenarioDeck: "path",
    sizeType: "tarot",
  },
  Path8: {
    imagePath: "/Path8/",
    scenarioDeck: "path",
    sizeType: "tarot",
  },
  Path9: {
    imagePath: "/Path9/",
    scenarioDeck: "path",
    sizeType: "tarot",
  },
  Miscellaneous: {
    imagePath: "/Miscellaneous/",
    scenarioDeck: "misc",
    sizeType: "tarot",
  },
};

const DeckToTypeMap = {
  Dúnedain: "player_card",
  Dwarf: "player_card",
  Elf: "player_card",
  Hobbit: "player_card",
  Rohan: "player_card",
  Wizard: "player_card",
  Isengard: "player_card",
  Monstrous: "player_card",
  Mordor: "player_card",
  Southron: "player_card",
  "Shadow Strongholds": "stronghold",
  "Free People Strongholds": "stronghold",
  Path1: "path",
  Path2: "path",
  Path3: "path",
  Path4: "path",
  Path5: "path",
  Path6: "path",
  Path7: "path",
  Path8: "path",
  Path9: "path",
  Miscellaneous: "misc",
};
const DeckToBackImageMap = {
  Dúnedain: "free_people_player_card_back.jpg",
  Dwarf: "free_people_player_card_back.jpg",
  Elf: "free_people_player_card_back.jpg",
  Hobbit: "free_people_player_card_back.jpg",
  Rohan: "free_people_player_card_back.jpg",
  Wizard: "free_people_player_card_back.jpg",
  Isengard: "shadow_player_card_back.jpg",
  Monstrous: "shadow_player_card_back.jpg",
  Mordor: "shadow_player_card_back.jpg",
  Southron: "shadow_player_card_back.jpg",
  "Shadow Strongholds": "shadow_stronghold_back.jpg",
  "Free People Strongholds": "free_people_stronghold_back.jpg",
  Path1: "path1_back.jpg",
  Path2: "path2_back.jpg",
  Path3: "path3_back.jpg",
  Path4: "path4_back.jpg",
  Path5: "path5_back.jpg",
  Path6: "path6_back.jpg",
  Path7: "path7_back.jpg",
  Path8: "path8_back.jpg",
  Path9: "path9_back.jpg",
};

const SpecificCardToBackImageMap = {
  m1: "m2.png",
  m2: "m1.png",
  m3: "m4.png",
  m4: "m3.png",
  m5: "m6.png",
  m6: "m5.png",
};

const resolution = 500;

DeckToAdjustmentsMap = {
  Dúnedain: `/tr:w-${resolution}`,
  Dwarf: `/tr:w-${resolution}`,
  Elf: `/tr:w-${resolution}`,
  Hobbit: `/tr:w-${resolution}`,
  Rohan: `/tr:w-${resolution}`,
  Wizard: `/tr:w-${resolution}`,
  Isengard: `/tr:w-${resolution}`,
  Monstrous: `/tr:w-${resolution}`,
  Mordor: `/tr:w-${resolution}`,
  Southron: `/tr:w-${resolution}`,
  "Shadow Strongholds": `/tr:w-${resolution}`,
  "Free People Strongholds": `/tr:w-${resolution}`,
  Path1: `/tr:w-${resolution}`,
  Path2: `/tr:w-${resolution}`,
  Path3: `/tr:w-${resolution}`,
  Path4: `/tr:w-${resolution}`,
  Path5: `/tr:w-${resolution}`,
  Path6: `/tr:w-${resolution}`,
  Path7: `/tr:w-${resolution}`,
  Path8: `/tr:w-${resolution}`,
  Path9: `/tr:w-${resolution}`,
  Miscellaneous: `/tr:w-${resolution}`,
};

const doWork = async () => {
  try {
    let cardsData = {};
    console.log("create output folder");
    await mkdirp(outputDirLoadFile);
    console.log("reading packs input folder");
    const packs = await readdir(packsInputFolder);

    // Store all the cards
    console.log("Generating card metadata");
    for (const pFilename of packs) {
      const p = await readfile(`${packsInputFolder}/${pFilename}`);
      const jsonPack = JSON.parse(p);
      for (const card of jsonPack.AllCards) {
        // See if there's a specific override for back for the card
        let backImage = SpecificCardToBackImageMap[card.Code];

        const fullCard = {
          ...card,
          FrontImage: `${baseImgUrl}${DeckToAdjustmentsMap[card.Deck]}${
            DeckToMetadataMap[card.Deck].imagePath
          }${card.Code}.png`,
          BackImage: `${baseImgUrl}${DeckToAdjustmentsMap[card.Deck]}${
            DeckToMetadataMap[card.Deck].imagePath
          }${backImage || DeckToBackImageMap[card.Deck]}`,
          Type: DeckToTypeMap[card.Deck],
          ScenarioDeck: DeckToMetadataMap[card.Deck].scenarioDeck,
          CardSize: DeckToMetadataMap[card.Deck].sizeType,
        };
        cardsData[card.Code] = fullCard;
      }
    }

    // Load all scenarios
    console.log("reading scenarios input folder");
    const scenarios = await readdir(scenariosInputFolder);

    fs.writeFileSync(outputLoadFile, "", (e) => {
      if (!!e) console.log(e);
    });

    fs.appendFileSync(outputLoadFile, "export const packList = [\n");

    for (const sFilename of scenarios) {
      // ignore any non-json file
      if (sFilename.endsWith(".ts")) {
        continue;
      }
      const s = await readfile(`${scenariosInputFolder}/${sFilename}`);
      const sJSON = JSON.parse(s);
      let sCards = sJSON.Cards.map((c) => ({
        ...c,
        ...cardsData[c.Code],
      }));
      sJSON.Cards = sCards;

      // Write the full scenario to the public location and make an import entry
      await writefile(
        `${outputScenarioDir}/${sFilename}`,
        JSON.stringify(sJSON, null, 2)
      );

      fs.appendFileSync(outputLoadFile, `"${sFilename}",\n`, (e) => {
        if (!!e) console.log(e);
      });
    }

    fs.appendFileSync(outputLoadFile, "];");
  } catch (e) {
    console.log(e);
  }
};

doWork();
