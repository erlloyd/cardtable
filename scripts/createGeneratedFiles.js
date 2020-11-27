const fs = require("fs");
const util = require("util");

const readdir = util.promisify(fs.readdir);

const inputFolder = "./src/external/marvelsdb-json-data/pack/";
const outputFile = "./src/external/generated/packs.ts";

const doWork = async () => {
  try {
    console.log("reading input folder");
    const files = await readdir(inputFolder);
    const filesWithCodes = files.map((fname) => ({
      fname,
      code: fname.split(".")[0],
    }));

    console.log(`found ${files.length} number of files`);

    fs.writeFile(outputFile, "", () => {});

    filesWithCodes
      .filter((fd) => fd.code !== "wsp")
      .forEach((fileData) => {
        fs.appendFile(
          outputFile,
          `import ${fileData.code} from "../../external/marvelsdb-json-data/pack/${fileData.fname}";\n`,
          () => {}
        );
      });

    fs.appendFile(
      outputFile,
      `export {${filesWithCodes
        .filter((fd) => fd.code !== "wsp")
        .map((f) => f.code)
        .join(",\n")}};`,
      () => {}
    );
    console.log("Done!");
  } catch (e) {
    console.log(e);
  }
};

doWork();
