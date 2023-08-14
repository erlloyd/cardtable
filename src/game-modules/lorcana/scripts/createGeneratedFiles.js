const { mkdirp } = require("mkdirp");
const fs = require("fs");
const util = require("util");

const readdir = util.promisify(fs.readdir);
const readfile = util.promisify(fs.readFile);
const writefile = util.promisify(fs.writeFile);

const packsInputFolder = "./src/game-modules/lorcana/external/sets";

const outputDirLoadFile = "./src/game-modules/lorcana/generated";

const publicFolder = "./public/json_data";

const outputFile = `${outputDirLoadFile}/packsList.ts`;

const doWork = async () => {
  try {
    let cardsData = {};
    console.log("create output folder");
    await mkdirp(outputDirLoadFile);

    console.log("create packList file");
    fs.writeFileSync(outputFile, "", (e) => {
      if (!!e) console.log(e);
    });

    fs.appendFileSync(outputFile, "export const packList = [\n");

    console.log("reading packs input folder");
    const packs = await readdir(packsInputFolder);

    // For lorcana we can just copy the raw data
    console.log("Copying card metadata");
    for (const pFilename of packs) {
      fs.appendFileSync(outputFile, `"lorcana_${pFilename}",\n`, (e) => {
        if (!!e) console.log(e);
      });

      fs.copyFileSync(
        `${packsInputFolder}/${pFilename}`,
        `${publicFolder}/lorcana_${pFilename}`
      );
    }
    fs.appendFileSync(outputFile, "];");
  } catch (e) {
    console.log(e);
  }
};

doWork();
