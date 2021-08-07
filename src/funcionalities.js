const fs = require('fs');

const funcionalities = {
    readData() {
        let rawData = fs.readFileSync('./data/db.json');
        let obj = JSON.parse(rawData);
        return obj;
    },
    writeData(db){
        db = JSON.stringify(db, null, 4);
        fs.writeFileSync('./data/db.json', db);
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