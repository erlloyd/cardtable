const mkdirp = require("mkdirp");
const fs = require("fs");
const util = require("util");

const readdir = util.promisify(fs.readdir);
const readfile = util.promisify(fs.readFile);
const writefile = util.promisify(fs.writeFile);

const packsInputFolder =
  "./src/game-modules/star-wars-deckbuilding-game/jsonMetadata/packs";
const scenariosInputFolder =
  "./src/game-modules/star-wars-deckbuilding-game/jsonMetadata/scenarios";
const outputScenarioDir = "./public/json_data/scenarios";
const outputDirLoadFile =
  "./src/game-modules/star-wars-deckbuilding-game/generated";
const outputLoadFile = `${outputDirLoadFile}/scenarioList_swdbg.ts`;

const baseImgUrl =
  "https://ik.imagekit.io/cardtable/star_wars_deckbuilding_game";

const resolution = 500;

const DeckToMetadataMap = {
  "Rebel Starter": {
    adjustment: `/tr:w-${resolution}`,
    imagePath: "/rebel_starter/",
    backImagePath: "/misc/",
    backImage: "card_back.png",
    scenarioDeck: "rebel_starter",
    type: "starter",
    sizeType: "standard",
  },
  "Empire Starter": {
    adjustment: `/tr:w-${resolution}`,
    imagePath: "/empire_starter/",
    backImagePath: "/misc/",
    backImage: "card_back.png",
    scenarioDeck: "empire_starter",
    type: "starter",
    sizeType: "standard",
  },
  "Rebel Bases": {
    adjustment: `/tr:w-${resolution}`,
    imagePath: "/bases/",
    backImagePath: "/misc/",
    backImage: "rebel_base_back.png",
    scenarioDeck: "base",
    type: "base",
    sizeType: "standard",
  },
  "Empire Bases": {
    adjustment: `/tr:w-${resolution}`,
    imagePath: "/bases/",
    backImagePath: "/misc/",
    backImage: "empire_base_back.png",
    scenarioDeck: "base",
    type: "base",
    sizeType: "standard",
  },
  "Capital Ships": {
    adjustment: `/tr:w-${resolution}`,
    imagePath: "/capital_ships/",
    backImagePath: "/misc/",
    backImage: "card_back_rotated.png",
    scenarioDeck: "capital_ship",
    type: "capital_ship",
    sizeType: "standard",
  },
  "Always Available": {
    adjustment: `/tr:w-${resolution}`,
    imagePath: "/always_available/",
    backImagePath: "/misc/",
    backImage: "card_back.png",
    scenarioDeck: "always_available",
    type: "galaxy_row",
    sizeType: "standard",
  },
  "Galaxy Row Rebel": {
    adjustment: `/tr:w-${resolution}`,
    imagePath: "/galaxy_row/",
    backImagePath: "/misc/",
    backImage: "card_back.png",
    scenarioDeck: "galaxy_row",
    type: "galaxy_row_rebel",
    sizeType: "standard",
  },
  "Galaxy Row Empire": {
    adjustment: `/tr:w-${resolution}`,
    imagePath: "/galaxy_row/",
    backImagePath: "/misc/",
    backImage: "card_back.png",
    scenarioDeck: "galaxy_row",
    type: "galaxy_row_empire",
  },
  "Galaxy Row Neutral": {
    adjustment: `/tr:w-${resolution}`,
    imagePath: "/galaxy_row/",
    backImagePath: "/misc/",
    backImage: "card_back.png",
    scenarioDeck: "galaxy_row",
    type: "galaxy_row_neutral",
    sizeType: "standard",
  },
  Miscellaneous: {
    adjustment: `/tr:w-${resolution}`,
    imagePath: "/misc/",
    backImagePath: "/misc/",
    backImage: "card_back.png",
    scenarioDeck: "misc",
    type: "misc",
    sizeType: "standard",
  },
  "Force Tracker": {
    adjustment: `/tr:w-${resolution}`,
    imagePath: "/misc/",
    backImagePath: "/misc/",
    backImage: "card_back.png",
    scenarioDeck: "force_tracker",
    type: "force_tracker",
    sizeType: "doublestandardvertical",
  },
};

const SpecificCardToBackImageMap = {
  force_tracker: "force_tracker.png",
  quick_reference_1: "quick_reference_2.png",
  quick_reference_2: "quick_reference_1.png",
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
          FrontImage: `${baseImgUrl}${DeckToMetadataMap[card.Deck].adjustment}${
            DeckToMetadataMap[card.Deck].imagePath
          }${card.Code}.png`,
          BackImage: `${baseImgUrl}${DeckToMetadataMap[card.Deck].adjustment}${
            DeckToMetadataMap[card.Deck].backImagePath
          }${backImage || DeckToMetadataMap[card.Deck].backImage}`,
          Type: DeckToMetadataMap[card.Deck].type,
          ScenarioDeck: card.Deck,
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
      console.log(
        `Just generated the ${outputScenarioDir}/${sFilename} scenario`
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
