const { mkdirp } = require("mkdirp");
const fs = require("fs");
const util = require("util");

const readdir = util.promisify(fs.readdir);
const readfile = util.promisify(fs.readFile);
const writefile = util.promisify(fs.writeFile);

const packsInputFolder =
  "./src/game-modules/marvel-legendary/external/downloadedSetData";

const outputDirLoadFile = "./src/game-modules/marvel-legendary/generated";

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

    // For marvel legendary we can just copy the raw data
    console.log("Copying card metadata");
    for (const pFilename of packs) {
      if (pFilename === "sets.json") {
        continue;
      }

      //WhatIf doesn't have images yet
      if (pFilename === "MSWhatIf.json") {
        continue;
      }

      fs.appendFileSync(
        outputFile,
        `"marvel_legendary_${pFilename}",\n`,
        (e) => {
          if (!!e) console.log(e);
        }
      );

      fs.copyFileSync(
        `${packsInputFolder}/${pFilename}`,
        `${publicFolder}/marvel_legendary_${pFilename}`
      );
    }
    fs.appendFileSync(outputFile, "];");
  } catch (e) {
    console.log(e);
  }
};

doWork();
