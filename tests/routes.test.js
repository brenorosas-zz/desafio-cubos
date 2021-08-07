const request = require("supertest");
const app = require('../src/server.js')
const fs = require('fs');
const funcionalities = require('../src/funcionalities.js')

describe("Test my routes", () => {
    describe("get /showLine", () => {
        it("Should show everyone in the line", async () => {
            let db = funcionalities.readData();
            let dbTest = {
                "nextId": 4,
                "users": [],
                "queue": []
            }
            for(let i = 1; i < 4; i++){
                let user = funcionalities.newUser(`user${i}`, `user${i}@test.com`, "masculino")
                user = Object.assign({id: i}, user);
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
            });
            funcionalities.writeData(dbTest);
            const res = await request(app).get('/showLine');
            expect(res.body).toStrictEqual(expected);
            funcionalities.writeData(db);
        });
    });

    describe("post /createUser", () => {
        it("Should create a user with the correct id", async () => {
            let db = funcionalities.readData();
            let dbTest = {
                "nextId": 1,
                "users": [],
                "queue": []
            }
            let users = [];
            for(let i = 0; i < 2; i++){
                let user = funcionalities.newUser(`user${i}`, `user${i}@test.com`, "masculino");
                users.push(user);
            }
            funcionalities.writeData(dbTest);
            for(let i = 0; i < 2; i++){
                let res = await request(app).post('/createUser').send(users[i]);
                users[i].id = i + 1;
                expect(res.body).toStrictEqual(users[i]);
            }
            funcionalities.writeData(db);
        });

        it("Should return bad request", async () => {
            let user = {
                "name": "user1",
                "email": "incorrectEmailFormat",
                "gender": "masculino"
            }
            let res = await request(app).post('/createUser').send(user);
            expect(res.statusCode).toBe(400);
            user = {
                "n": "incorrectField",
                "email": "user@user.com",
                "gender": "masculino"
            }
            res = await request(app).post('/createUser').send(user);
            expect(res.statusCode).toBe(400);
            user = {
                "name": "userWithoutEmail",
                "gender": "masculino"
            }
            res = await request(app).post('/createUser').send(user);
            expect(res.statusCode).toBe(400);
            user = {
                "name": "userWithoutGender",
                "email": "user@user.com"
            }
            res = await request(app).post('/createUser').send(user);
            expect(res.statusCode).toBe(400);
        });

        it("Should return conflict error", async () => {
            let db = funcionalities.readData();
            let dbTest = {
                "nextId": 2,
                "users": [
                    {
                        "id": 1,
                        "name": "user",
                        "email": "user@user.com",
                        "gender": "masculino"
                    }
                ],
                "queue": []
            }
            let user = {
                "name": "testUser",
                "email": "user@user.com",
                "gender": "masculino"
            }
            funcionalities.writeData(dbTest);
            let res = await request(app).post('/createUser').send(user);
            expect(res.statusCode).toBe(409);
            funcionalities.writeData(db);
        });
    });

    describe("post /addToLine", () => {
        it("Should add to line and return the correct position", async () => {
            let db = funcionalities.readData();
            let amount = 2;
            let dbTest = {
                "nextId": amount + 1,
                "users": [],
                "queue": []
            }
            for(let i = 1; i <= amount; i++){
                let user = funcionalities.newUser(`user${i}`, `user${i}@test.com`, "masculino");
                user = Object.assign({id: i}, user);
                dbTest.users.push(user);
            }
            funcionalities.writeData(dbTest);
            for(let i = 1; i <= amount; i++){
                let res = await request(app).post('/addToLine').send({"id": i});;
                expect(res.body).toStrictEqual({"position": i});
            }
            dbTest = fs.readFileSync('./data/db.json');
            dbTest = JSON.parse(dbTest);
            expect(dbTest.queue.length).toBe(2);
            funcionalities.writeData(db);
        });

        it("Should return bad request", async () => {
            let res = await request(app).post('/addToLine').send({});;
            expect(res.statusCode).toBe(400);
        });

        it("Should return not found error", async () => {
            let db = funcionalities.readData();
            let dbTest = {
                "nextId": 1,
                "users": [],
                "queue": []
            }
            funcionalities.writeData(dbTest);
            let res = await request(app).post('/addToLine').send({"id": 999});;
            expect(res.statusCode).toBe(404);
            funcionalities.writeData(db);
        });

        it("Should return conflict error", async () =>{
            let db = funcionalities.readData();
            let user = funcionalities.newUser("user1", "user1@user.com", "masculino");
            user = Object.assign({id: 1}, user);
            let dbTest = {
                "nextId": 2,
                "users": [user],
                "queue": [user]
            }
            funcionalities.writeData(dbTest);
            let res = await request(app).post('/addToLine').send({"id": 1});;
            expect(res.statusCode).toBe(409);
            funcionalities.writeData(db);
        });
    });

    describe("post /findPosition", () => {
        it("Should return the correct position", async () => {
            let db = funcionalities.readData();
            let amount = 4
            let dbTest = {
                "nextId": amount + 1,
                "users": [],
                "queue": []
            }
            for(let i = 1; i <= amount; i++){
                let gender = "masculino";
                if(i % 2 == 1) gender = "feminino";
                let user = funcionalities.newUser(`user${i}`, `user${i}@mail.com`, gender);
                user = Object.assign({id: i}, user);
                dbTest.users.push(user);
                dbTest.queue.push(user);
            }
            funcionalities.writeData(dbTest);
            for(let i = 1; i <= amount; i++){
                let res = await request(app).post('/findPosition').send({"email": `user${i}@mail.com`});;
                expect(res.body).toStrictEqual({"position": i});
            }
            funcionalities.writeData(db);
        });
        
        it("Should return bad request", async () => {
            let res = await request(app).post('/findPosition').send({});;
            expect(res.statusCode).toBe(400);
            res = await request(app).post('/findPosition').send({"email": "incorrectEmailFormat"});;
            expect(res.statusCode).toBe(400);
        });

        it("Should return not found error", async () => {
            let db = funcionalities.readData();
            let dbTest = {
                "nextId": 1,
                "users": [],
                "queue": []
            }
            funcionalities.writeData(dbTest);
            let res = await request(app).post('/findPosition').send({"email": "inexistentEmail@mail.com"});;
            expect(res.statusCode).toBe(404);
            funcionalities.writeData(db);
        });
    });

    describe("post /filterLine", () => {
        it("Should do the correct filter of the line", async () => {
            let db = funcionalities.readData();
            let amount = 4
            let dbTest = {
                "nextId": amount + 1,
                "users": [],
                "queue": []
            }
            for(let i = 1; i <= amount; i++){
                let gender = "masculino";
                if(i % 2 == 1) gender = "feminino";
                let user = funcionalities.newUser(`user${i}`, `user${i}@mail.com`, gender);
                user = Object.assign({id: i}, user);
                dbTest.users.push(user);
                dbTest.queue.push(user);
            }
            funcionalities.writeData(dbTest);
            let res = await request(app).post('/filterLine').send({"gender": "masculino"});;
            res.body.forEach(user => {
                expect(user.gender).toStrictEqual("masculino");
            });
            res = await request(app).post('/filterLine').send({"gender": "feminino"});;
            res.body.forEach(user => {
                expect(user.gender).toStrictEqual("feminino");
            });
            funcionalities.writeData(db);
        });

        it("Should return bad request", async () => {
            let res = await request(app).post('/filterLine').send({});;
            expect(res.statusCode).toBe(400);
        });
    });

    describe("post /popLine", () => {
        it("Should remove the first one from the queue correctly", async () => {
            let db = funcionalities.readData();
            let amount = 4
            let dbTest = {
                "nextId": amount + 1,
                "users": [],
                "queue": []
            }
            for(let i = 1; i <= amount; i++){
                let gender = "masculino";
                if(i % 2 == 1) gender = "feminino";
                let user = funcionalities.newUser(`user${i}`, `user${i}@mail.com`, gender);
                user = Object.assign({id: i}, user);
                dbTest.users.push(user);
                dbTest.queue.push(user);
            }
            let queue = dbTest.queue;
            funcionalities.writeData(dbTest);
            for(let i = 0; i < amount; i++){
                let res = await request(app).post('/popLine');
                expect(res.body).toStrictEqual(queue[i]);
            }
            funcionalities.writeData(db);
        });

        it("Should return bad request", async () => {
            let db = funcionalities.readData();
            let dbTest = {
                "nextId": 1,
                "users": [],
                "queue": []
            }
            funcionalities.writeData(dbTest);
            let res = await request(app).post('/popLine');
            expect(res.statusCode).toBe(400);
            funcionalities.writeData(db);
        });
    });
});