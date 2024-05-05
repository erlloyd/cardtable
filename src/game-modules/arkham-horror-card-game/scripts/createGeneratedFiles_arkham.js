const { mkdirp } = require("mkdirp");
const fs = require("fs");
const util = require("util");

const readdir = util.promisify(fs.readdir);

const inputFolder = "./src/external/arkhamdb-json-data/pack/";
const encounters = "./src/external/arkhamdb-json-data/encounters.json";
const outputDir = "./src/game-modules/arkham-horror-card-game/generated";
const outputFile2 = `${outputDir}/packsList.ts`;
const outputSets = `${outputDir}/sets.json`;
const publicFolder = "./public/json_data/from_modules/arkhamhorrorcardgame/";

const doWork = async () => {
  try {
    console.log("create output folder");
    await mkdirp(outputDir);
    console.log("reading input folder");
    const packGroups = await readdir(inputFolder);
    await mkdirp(publicFolder);

    fs.writeFileSync(outputFile2, "", (e) => {
      if (!!e) console.log(e);
    });

    fs.appendFileSync(outputFile2, "export const packList = [\n");

    fs.writeFileSync(outputSets, "", (e) => {
      if (!!e) console.log(e);
    });

    // First, read in the encounters
    const encounterFileContents = fs.readFileSync(encounters);
    const encountersJson = JSON.parse(encounterFileContents.toString());

    for (pg of packGroups) {
      const files = await readdir(`${inputFolder}${pg}/`);
      const filesWithCodes = files.map((fname) => ({
        fname,
        code: fname.split(".")[0],
      }));

      console.log(`found ${files.length} number of files for ${pg}`);

      filesWithCodes.forEach((fileData) => {
        fs.appendFileSync(outputFile2, `"${fileData.fname}",\n`, (e) => {
          if (!!e) console.log(e);
        });

        fs.copyFileSync(
          `${inputFolder}${pg}/${fileData.fname}`,
          `${publicFolder}${fileData.fname}`
        );

        // read the contents to figure out which encounters are in which pack
        const packFileContents = fs.readFileSync(
          `${inputFolder}${pg}/${fileData.fname}`
        );

        const packFileJson = JSON.parse(packFileContents.toString());

        packFileJson.forEach((pf) => {
          if (pf.encounter_code && pf.pack_code) {
            const encounter = encountersJson.find(
              (e) => e.code === pf.encounter_code
            );
            encounter.pack_code = pf.pack_code;

            if (encounter.isScenario === undefined) {
              encounter.isScenario = false;
            }

            if (!encounter.isScenario && pf.type_code === "scenario") {
              encounter.isScenario = true;
            }
          }
        });
      });
    }

    fs.appendFileSync(outputFile2, "];");

    fs.appendFileSync(outputSets, JSON.stringify(encountersJson, null, 2));

    console.log("Done!");
  } catch (e) {
    console.log(e);
  }
};

doWork();
