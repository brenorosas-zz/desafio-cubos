const fs = require("fs");
const util = require("util");

const dataHandler = {
  readData: async () => {
    const readFile = util.promisify(fs.readFile);
    let rawData = await readFile("./data/database.json", "utf8");
    let obj = JSON.parse(rawData);
    return obj;
  },
  writeData: async (db) => {
    const writeFile = util.promisify(fs.writeFile);
    db = JSON.stringify(db, null, 4);
    await writeFile("./data/database.json", db);
  },
};

module.exports = dataHandler;
