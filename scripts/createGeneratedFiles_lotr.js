const mkdirp = require("mkdirp");
const fs = require("fs");
const util = require("util");

const readdir = util.promisify(fs.readdir);

const inputFolder = "./src/external/ringsteki-json-data/packs/";
const outputDir = "./src/generated";
const outputFile2 = `${outputDir}/packsList_lotr.ts`;
const publicFolder = "./public/json_data";

const doWork = async () => {
  try {
    console.log("create output folder");
    await mkdirp(outputDir);
    console.log("reading input folder");
    const files = await readdir(inputFolder);
    const filesWithCodes = files
      .filter((fname) => fname.indexOf("reorder") === -1)
      // .filter((fname) => fname.indexOf("reorder" === -1))
      .map((fname) => ({
        fname,
        code: fname
          .split(".")[0]
          .toLocaleLowerCase()
          .split(" ")
          .join("_")
          .replace(/'/g, "")
          .replace(/:/g, "")
          .replace(/-/g, "_")
          .replace(/,/g, ""),
      }));

    console.log(`found ${filesWithCodes.length} number of files`);

    fs.writeFileSync(outputFile2, "", (e) => {
      if (!!e) console.log(e);
    });

    fs.appendFileSync(outputFile2, "export const packList = [\n");

    filesWithCodes.forEach((fileData) => {
      fs.appendFileSync(outputFile2, `"${fileData.fname}",\n`, (e) => {
        if (!!e) console.log(e);
      });

      fs.copyFileSync(
        `${inputFolder}/${fileData.fname}`,
        `${publicFolder}/${fileData.fname}`
      );
    });

    fs.appendFileSync(outputFile2, "];");

    console.log("Done!");
  } catch (e) {
    console.log(e);
  }
};

doWork();
