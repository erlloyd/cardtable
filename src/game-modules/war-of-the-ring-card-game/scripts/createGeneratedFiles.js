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
const DeckToImagePathMap = {
  Dúnedain: "/free_people_player_cards/",
  Dwarf: "/free_people_player_cards/",
  Elf: "/free_people_player_cards/",
  Hobbit: "/free_people_player_cards/",
  Rohan: "/free_people_player_cards/",
  Wizard: "/free_people_player_cards/",
  Isengard: "/shadow_player_cards/",
  Monstrous: "/shadow_player_cards/",
  Mordor: "/shadow_player_cards/",
  Southron: "/shadow_player_cards/",
  "Shadow Strongholds": "/shadow_strongholds/",
  "Free People Strongholds": "/free_people_strongholds/",
  Path1: "/Path1/",
  Path2: "/Path2/",
  Path3: "/Path3/",
  Path4: "/Path4/",
  Path5: "/Path5/",
  Path6: "/Path6/",
  Path7: "/Path7/",
  Path8: "/Path8/",
  Path9: "/Path9/",
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
        const fullCard = {
          ...card,
          FrontImage: `${baseImgUrl}${DeckToAdjustmentsMap[card.Deck]}${
            DeckToImagePathMap[card.Deck]
          }${card.Code}.png`,
          BackImage: `${baseImgUrl}${DeckToAdjustmentsMap[card.Deck]}${
            DeckToImagePathMap[card.Deck]
          }${DeckToBackImageMap[card.Deck]}`,
          Type: DeckToTypeMap[card.Deck],
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
