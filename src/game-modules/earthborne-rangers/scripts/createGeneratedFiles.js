const { mkdirp } = require("mkdirp");
const fs = require("fs");
const util = require("util");

const readdir = util.promisify(fs.readdir);
const readfile = util.promisify(fs.readFile);
const writefile = util.promisify(fs.writeFile);

const setsInputFolder1 = "./src/game-modules/earthborne-rangers/external/sets";
const setsInputFolder2 =
  "./src/game-modules/earthborne-rangers/external/sets/path";
const setsInputFolder3 =
  "./src/game-modules/earthborne-rangers/external/sets/ranger";

const outputDirLoadFile = "./src/game-modules/earthborne-rangers/generated";
const outputLoadFile = `${outputDirLoadFile}/setList_earthborne-rangers.ts`;

const doWork = async () => {
  try {
    let cardsData = {};
    console.log("create output folder");
    await mkdirp(outputDirLoadFile);
    console.log("reading packs input folder");
    let packs = (await readdir(setsInputFolder1)).filter(
      (n) => n.includes(".json") && n !== "sets.json"
    );
    packs = packs.concat(
      (await readdir(setsInputFolder2)).map((n) => `path/${n}`)
    );
    packs = packs.concat(
      (await readdir(setsInputFolder3)).map((n) => `ranger/${n}`)
    );

    // Store all the cards
    console.log("Generating card metadata");
    fs.writeFileSync(outputLoadFile, "", (e) => {
      if (!!e) console.log(e);
    });
    fs.appendFileSync(outputLoadFile, "export const packList = [\n");

    for (const pFilename of packs) {
      const p = await readfile(`${setsInputFolder1}/${pFilename}`);
      const jsonPack = JSON.parse(p);
      for (const card of jsonPack) {
        cardsData[card.code] = card;
      }
      fs.appendFileSync(outputLoadFile, `"${pFilename}",\n`, (e) => {
        if (!!e) console.log(e);
      });
    }

    fs.appendFileSync(outputLoadFile, "];");
  } catch (e) {
    console.log(e);
  }
};

doWork();
