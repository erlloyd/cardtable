const mkdirp = require("mkdirp");
const fs = require("fs");
const util = require("util");

const readdir = util.promisify(fs.readdir);

const inputFolder = "./src/game-modules/war-of-the-ring-card-game/jsonMetadata";
const outputDir = "./src/game-modules/war-of-the-ring-card-game/generated";

const doWork = async () => {
  try {
    console.log("create output folder");
    await mkdirp(outputDir);
  } catch (e) {
    console.log(e);
  }
};

doWork();
