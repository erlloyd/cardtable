const mkdirp = require("mkdirp");
const fs = require("fs");
const util = require("util");

const readdir = util.promisify(fs.readdir);

const inputFolder = "./src/external/ringsteki-json-data/packs/";
const outputDir = "./src/external/generated";
const outputFile = `${outputDir}/packs_lotr.ts`;

const doWork = async () => {
  try {
    console.log("create output folder");
    await mkdirp(outputDir);
    console.log("reading input folder");
    const files = await readdir(inputFolder);
    const filesWithCodes = files.map((fname) => ({
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

    console.log(`found ${files.length} number of files`);

    fs.writeFileSync(outputFile, "", (e) => {
      if (!!e) console.log(e);
    });

    filesWithCodes.forEach((fileData) => {
      fs.appendFileSync(
        outputFile,
        `import ${fileData.code} from "../../external/ringsteki-json-data/packs/${fileData.fname}";\n`,
        (e) => {
          if (!!e) console.log(e);
        }
      );
    });

    fs.appendFileSync(
      outputFile,
      `export {${filesWithCodes.map((f) => f.code).join(",\n")}};`,
      (e) => {
        if (!!e) console.log(e);
      }
    );
    console.log("Done!");
  } catch (e) {
    console.log(e);
  }
};

doWork();
