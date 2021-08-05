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

    describe("post /createUser", () => {
        it("Should create a user with the correct id", async () => {
            let db = fs.readFileSync('./data/db.json');
            db = JSON.parse(db);
            let dbTest = {
                "nextId": 1,
                "users": [],
                "queue": []
            }
            let users = [];
            for(let i = 0; i < 2; i++){
                users.push({
                    name: `user${i}`,
                    email: `user${i}@test.com`,
                    gender: "masculino"
                })
            }
            dbTest = JSON.stringify(dbTest, null, 4);
            fs.writeFileSync('./data/db.json', dbTest);
            for(let i = 0; i < 2; i++){
                let res = await request(app).post('/createUser').send(users[i]);
                users[i].id = i + 1;
                expect(res.body).toStrictEqual(users[i]);
            }
            db = JSON.stringify(db, null, 4);
            fs.writeFileSync('./data/db.json', db);
        })

        it("Should return bad request", async () => {
            let user = {
                "name": "user1",
                "email": "user1",
                "gender": "masculino"
            }
            let res = await request(app).post('/createUser').send(user);
            expect(res.statusCode).toBe(400);
            user = {
                "n": "user",
                "email": "user@user.com",
                "gender": "masculino"
            }
            res = await request(app).post('/createUser').send(user);
            expect(res.statusCode).toBe(400);
            user = {
                "name": "user",
                "gender": "masculino"
            }
            res = await request(app).post('/createUser').send(user);
            expect(res.statusCode).toBe(400);
            user = {
                "name": "user",
                "email": "user@user.com"
            }
            res = await request(app).post('/createUser').send(user);
            expect(res.statusCode).toBe(400);
        })

        it("Should return conflict error", async () => {
            let db = fs.readFileSync('./data/db.json');
            db = JSON.parse(db);
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
            dbTest = JSON.stringify(dbTest, null, 4);
            fs.writeFileSync('./data/db.json', dbTest);
            let res = await request(app).post('/createUser').send(user);
            expect(res.statusCode).toBe(409);
            db = JSON.stringify(db, null, 4);
            fs.writeFileSync('./data/db.json', db);
        })
    })

    describe("post /addToLine", () => {
        it("Should add to line and return the correct position", async () => {
            let db = fs.readFileSync('./data/db.json');
            db = JSON.parse(db);
            let dbTest = {
                "nextId": 3,
                "users": [
                    {
                        "id": 1,
                        "name": "user1",
                        "email": "user1@user.com",
                        "gender": "masculino"
                    },
                    {
                        "id": 2,
                        "name": "user2",
                        "email": "user2@user.com",
                        "gender": "masculino"
                    }
                ],
                "queue": []
            }
            dbTest = JSON.stringify(dbTest, null, 4);
            fs.writeFileSync('./data/db.json', dbTest);
            for(let i = 1; i <= 2; i++){
                let res = await request(app).post('/addToLine').send({"id": i});
                let position = i;
                expect(res.body).toStrictEqual(position);
            }
            dbTest = fs.readFileSync('./data/db.json');
            dbTest = JSON.parse(dbTest);
            expect(dbTest.queue.length).toBe(2);
            db = JSON.stringify(db, null, 4);
            fs.writeFileSync('./data/db.json', db);
        })

        it("Should return bad request", async () => {
            let res = await request(app).post('/addToLine').send({});
            expect(res.statusCode).toBe(400);
        })

        it("Should return not found error", async () => {
            let db = fs.readFileSync('./data/db.json');
            db = JSON.parse(db);
            let dbTest = {
                "nextId": 1,
                "users": [],
                "queue": []
            }
            dbTest = JSON.stringify(dbTest, null, 4);
            fs.writeFileSync('./data/db.json', dbTest);
            let res = await request(app).post('/addToLine').send({"id": 999});
            expect(res.statusCode).toBe(404);
            db = JSON.stringify(db, null, 4);
            fs.writeFileSync('./data/db.json', db);
        })

        it("Should return conflict error", async () =>{
            let db = fs.readFileSync('./data/db.json');
            db = JSON.parse(db);
            let dbTest = {
                "nextId": 1,
                "users": [
                    {
                        "id": 1,
                        "name": "user1",
                        "email": "user1@user.com",
                        "gender": "masculino"
                    }
                ],
                "queue": [
                    {
                        "id": 1,
                        "name": "user1",
                        "email": "user1@user.com",
                        "gender": "masculino"
                    }
                ]
            }
            dbTest = JSON.stringify(dbTest, null, 4);
            fs.writeFileSync('./data/db.json', dbTest);
            let res = await request(app).post('/addToLine').send({"id": 1});
            expect(res.statusCode).toBe(409);
            db = JSON.stringify(db, null, 4);
            fs.writeFileSync('./data/db.json', db);
        })
    })

    describe("post /findPosition", () => {
        it("Should return the correct position", async () => {
            let db = fs.readFileSync('./data/db.json');
            db = JSON.parse(db);
            let dbTest = {
                "nextId": 1,
                "users": [
                    {
                        "id": 1,
                        "name": "user1",
                        "email": "user1@user.com",
                        "gender": "masculino"
                    },
                    {
                        "id": 2,
                        "name": "user2",
                        "email": "user2@user.com",
                        "gender": "masculino"
                    }
                ],
                "queue": [
                    {
                        "id": 1,
                        "name": "user1",
                        "email": "user1@user.com",
                        "gender": "masculino"
                    },
                    {
                        "id": 2,
                        "name": "user2",
                        "email": "user2@user.com",
                        "gender": "masculino"
                    }
                ]
            }
            dbTest = JSON.stringify(dbTest, null, 4);
            fs.writeFileSync('./data/db.json', dbTest);
            for(let i = 1; i <= 2; i++){
                let res = await request(app).post('/findPosition').send({"email": `user${i}@user.com`});
                expect(res.body).toBe(i);
            }
            db = JSON.stringify(db, null, 4);
            fs.writeFileSync('./data/db.json', db);
        })
        
        it("Should return bad request", async () => {
            let res = await request(app).post('/findPosition').send({});
            expect(res.statusCode).toBe(400);
            res = await request(app).post('/findPosition').send({"email": "incorrectemailformat"});
            expect(res.statusCode).toBe(400);
        })

        it("Should return not found error", async () => {
            let db = fs.readFileSync('./data/db.json');
            db = JSON.parse(db);
            let dbTest = {
                "nextId": 1,
                "users": [],
                "queue": []
            }
            dbTest = JSON.stringify(dbTest, null, 4);
            fs.writeFileSync('./data/db.json', dbTest);
            let res = await request(app).post('/findPosition').send({"email": "inexistentEmail@mail.com"});
            expect(res.statusCode).toBe(404);
            db = JSON.stringify(db, null, 4);
            fs.writeFileSync('./data/db.json', db);
        })
    })

    describe("post /filterLine", () => {
        it("Should do the correct filter of the line", async () => {
            let db = fs.readFileSync('./data/db.json');
            db = JSON.parse(db);
            let dbTest = {
                "nextId": 1,
                "users": [
                    {
                        "id": 1,
                        "name": "user1",
                        "email": "user1@user.com",
                        "gender": "masculino"
                    },
                    {
                        "id": 2,
                        "name": "user2",
                        "email": "user2@user.com",
                        "gender": "feminino"
                    }
                ],
                "queue": [
                    {
                        "id": 1,
                        "name": "user1",
                        "email": "user1@user.com",
                        "gender": "masculino"
                    },
                    {
                        "id": 2,
                        "name": "user2",
                        "email": "user2@user.com",
                        "gender": "feminino"
                    }
                ]
            }
            dbTest = JSON.stringify(dbTest, null, 4);
            fs.writeFileSync('./data/db.json', dbTest);
            let res = await request(app).post('/filterLine').send({"gender": "masculino"});
            for(let i = 0; i < res.body.length; i++){
                expect(res.body[i].gender).toStrictEqual("masculino");
            }
            res = await request(app).post('/filterLine').send({"gender": "feminino"});
            for(let i = 0; i < res.body.length; i++){
                expect(res.body[i].gender).toStrictEqual("feminino");
            }
            db = JSON.stringify(db, null, 4);
            fs.writeFileSync('./data/db.json', db);
        })

        it("Should return bad request", async () => {
            let res = await request(app).post('/filterLine').send({});
            expect(res.statusCode).toBe(400);
        })
    })
})
// test('teste do teste', async () => {
//     expect(true).toBe(true);
// });