const fs = require('fs');
const util = require('util');
const funcionalities = {
    readData: async () => {
        const readFile = util.promisify(fs.readFile);
        let rawData = await readFile('./data/db.json', 'utf8');
        let obj = JSON.parse(rawData);
        return obj;
    },
    writeData: async (db) => {
        const writeFile = util.promisify(fs.writeFile);
        db = JSON.stringify(db, null, 4);
        await writeFile('./data/db.json', db);
    },
    newUser(name, email, gender){
        return {
            name,
            email,
            gender
        }
    }
}

module.exports = funcionalities;