const mkdirp = require("mkdirp");
const fs = require("fs");
const util = require("util");

const readdir = util.promisify(fs.readdir);

const inputFolder = "./src/external/marvelsdb-json-data/pack/";
const outputDir = "./src/generated";
const outputFile = `${outputDir}/packs.ts`;
const outputFile2 = `${outputDir}/packsList.ts`;
const publicFolder = "./public/json_data";

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

    fs.writeFileSync(outputFile2, "", (e) => {
      if (!!e) console.log(e);
    });

    fs.appendFileSync(outputFile2, "export const packList = [\n");

    filesWithCodes.forEach((fileData) => {
      fs.appendFileSync(
        outputFile,
        `import ${fileData.code} from "../external/marvelsdb-json-data/pack/${fileData.fname}";\n`,
        (e) => {
          if (!!e) console.log(e);
        }
      );

      fs.appendFileSync(outputFile2, `"${fileData.fname}",\n`, (e) => {
        if (!!e) console.log(e);
      });

      fs.copyFileSync(
        `${inputFolder}/${fileData.fname}`,
        `${publicFolder}/${fileData.fname}`
      );
    });

    fs.appendFileSync(outputFile2, "];");

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
