const express = require('express');
const routes = express.Router();
const validators = require('./validators');
const fs = require('fs');

routes.get('/showLine', (req, res) => {
    try{
        let rawData = fs.readFileSync('./data/db.json');
        let obj = JSON.parse(rawData);
        obj.queue = obj.queue.map((user, index) => {
            delete user.id;
            user.position = index + 1;
            return user;
        });
        return res.json(obj.queue);
    } catch {
        return res.status(500).end();
    }
});

routes.post('/createUser', (req, res) => {
    let validator = validators.createUserValidator.validate(req.body);
    if(validator.error)
        return res.status(400).json(validator.error.details);
    try{
        let rawData = fs.readFileSync('./data/db.json');
        let obj = JSON.parse(rawData);
        let newUser = {
            id: obj.nextId,
            name: req.body.name,
            email: req.body.email,
            gender: req.body.gender
        }
        let exist = obj.users.some(user => user.email == newUser.email);
        if(exist)
            return res.status(409).json({"error": "person is already registered"});
        obj.nextId++;
        obj.users.push(newUser);
        obj = JSON.stringify(obj, null, 4);
        fs.writeFileSync('./data/db.json', obj);
        return res.json(newUser);
    } catch {
        return res.status(500).end();
    }
});

routes.post('/addToLine', (req, res) => {
    let validator = validators.addToLineValidator.validate(req.body);
    if(validator.error)
        return res.status(400).json(validator.error.details);
    try{
        let rawData = fs.readFileSync('./data/db.json');
        let obj = JSON.parse(rawData);
        let id = req.body.id;
        let index = obj.users.findIndex(user => user.id == id);
        if(index == -1)
            return res.status(404).end();
        let exist = obj.queue.some(user => user.id == id);
        if(exist)
            return res.status(409).json({"error": "person is already in line"});
        let user = obj.users[index];
        obj.queue.push(user);
        let position = obj.queue.length;
        obj = JSON.stringify(obj, null, 4);
        fs.writeFileSync('./data/db.json', obj);
        return res.json(position);
    }
    catch{
        return res.status(500).end();
    }
});

routes.post('/findPosition', (req, res) => {
    let validator = validators.findPositionValidator.validate(req.body);
    if(validator.error)
        return res.status(400).json(validator.error.details);
    try{
        let rawData = fs.readFileSync('./data/db.json');
        let obj = JSON.parse(rawData);
        let email = req.body.email;
        let position = obj.queue.findIndex(user => user.email == email);
        if(position == -1)
            return res.status(404).end();
        return res.json(position + 1);
    } catch {
        return res.status(500).end();
    }
});

routes.post('/filterLine', (req, res) => {
    let validator = validators.filterLineValidator.validate(req.body);
    if(validator.error)
        return res.status(400).json(validator.error.details);
    try{
        let rawData = fs.readFileSync('./data/db.json');
        let obj = JSON.parse(rawData);
        let gender = req.body.gender;
        obj = obj.queue.filter((user, index) => {
            user.position = index + 1;
            delete user.id;
            return user.gender == gender;
        });
        return res.json(obj);
    } catch {
        return res.status(500).end();
    }
});

routes.post('/popLine', (req, res) => {
    try{
        let rawData = fs.readFileSync('./data/db.json');
        let obj = JSON.parse(rawData);
        if(obj.queue.length == 0)
            return res.status(400).json({"error": "queue is empty"});
        let user = obj.queue.shift();
        obj = JSON.stringify(obj, null, 4);
        fs.writeFileSync('./data/db.json', obj);
        return res.json(user);
    } catch {
        return res.status(500).end();
    }
});

module.exports = routes;