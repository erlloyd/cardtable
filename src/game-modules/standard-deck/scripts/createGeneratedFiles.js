const { mkdirp } = require("mkdirp");
const fs = require("fs");
const util = require("util");

const readdir = util.promisify(fs.readdir);
const readfile = util.promisify(fs.readFile);
const writefile = util.promisify(fs.writeFile);

const packsInputFolder = "./src/game-modules/standard-deck/jsonMetadata/packs";
const scenariosInputFolder =
  "./src/game-modules/standard-deck/jsonMetadata/scenarios";
const outputScenarioDir = "./public/json_data/scenarios";
const outputDirLoadFile = "./src/game-modules/standard-deck/generated";
const outputLoadFile = `${outputDirLoadFile}/scenarioList_std_deck.ts`;

const baseImgUrl = "https://ik.imagekit.io/cardtable/standard_deck";

const resolution = 500;

const DeckToMetadataMap = {
  Deck: {
    adjustment: `/tr:w-500`,
    imagePath: "/",
    backImagePath: "/",
    backImage: "card_back_red.png",
    scenarioDeck: "deck",
    type: "std",
    sizeType: "standard",
  },
};

const SpecificCardToBackImageMap = {};

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
      let sCards = sJSON.Cards.map((c) => {
        return {
          ...cardsData[c.Code],
          ...c,
        };
      });
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
