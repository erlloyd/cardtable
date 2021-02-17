const mkdirp = require("mkdirp");
const fs = require("fs");
const util = require("util");

const readdir = util.promisify(fs.readdir);

const inputFolder = "./src/external/marvelsdb-json-data/pack/";
const outputDir = "./src/external/generated";
const outputFile = `${outputDir}/packs.ts`;

const doWork = async () => {
  try {
    console.log("create output folder");
    await mkdirp(outputDir);
    console.log("reading input folder");
    const files = await readdir(inputFolder);
    const filesWithCodes = files.map((fname) => ({
      fname,
      code: fname.split(".")[0],
    }));

    console.log(`found ${files.length} number of files`);

    fs.writeFileSync(outputFile, "", (e) => {
      if (!!e) console.log(e);
    });

    filesWithCodes.forEach((fileData) => {
      fs.appendFileSync(
        outputFile,
        `import ${fileData.code} from "../../external/marvelsdb-json-data/pack/${fileData.fname}";\n`,
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
