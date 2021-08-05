const request = require("supertest");
const app = require('../src/server.js')
const fs = require('fs');

describe("Test my routes", () => {
    describe("get /showLine", () => {
        it("Should show everyone in the line", async () => {
            let db = fs.readFileSync('./data/db.json');
            db = JSON.parse(db);
            let dbTest = {
                "nextId": 4,
                "users": [],
                "queue": []
            }
            for(let i = 1; i < 4; i++){
                let user = {
                    "id": `${i}`,
                    "name": `user${i}`,
                    "email": `user${i}@test.com`,
                    "gender": "masculino"
                }
                dbTest.users.push(user);
                if(i % 2 == 1)
                    dbTest.queue.push(user);
            }
            let expected = dbTest.queue;
            let position = 1;
            expected = expected.map(user => {
                delete user.id;
                user.position = position++;
                return user;
            })
            dbTest = JSON.stringify(dbTest, null, 4);
            fs.writeFileSync('./data/db.json', dbTest);
            const res = await request(app).get('/showLine');
            expect(res.body).toStrictEqual(expected);
            db = JSON.stringify(db, null, 4);
            fs.writeFileSync('./data/db.json', db);
        })
    })
})
// test('teste do teste', async () => {
//     expect(true).toBe(true);
// });