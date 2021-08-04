const express = require('express');
const routes = express.Router();
const validators = require('./validators');
const fs = require('fs');

routes.get('/showLine', (req, res) => {
    let rawData = fs.readFileSync('./data/db.json');
    let obj = JSON.parse(rawData);
    let position = 1;
    obj.queue = obj.queue.map(user => {
        delete user.id;
        user.position = position++;
        return user;
    })

    return res.json(obj.queue);
});

routes.post('/createUser', (req, res) => {
    let rawData = fs.readFileSync('./data/db.json');
    let obj = JSON.parse(rawData);
    let validator = validators.createUserValidator.validate(req.body);
    if(validator.error){
        return res.status(400).json(validator.error.details);
    }
    let id = obj.nextId;
    let name = req.body.name;
    let email = req.body.email;
    let gender = req.body.gender;
    let exist = (obj.users.filter(user => user.email == email).length == 1);
    if(exist)
        return res.status(409).json({"error": "person is already registered"});
    try{
        let user = {"id": id, "name": name, "email": email, "gender": gender};
        obj.nextId++;
        obj.users.push(user);
        obj = JSON.stringify(obj, null, 4);
        fs.writeFileSync('./data/db.json', obj);
        return res.json(user);
    } catch {
        return res.status(500).end();
    }
});

routes.post('/addToLine', (req, res) => {
    let rawData = fs.readFileSync('./data/db.json');
    let obj = JSON.parse(rawData);
    let validator = validators.addToLineValidator.validate(req.body);
    if(validator.error)
        return res.status(400).json(validator.error.details);
    let id = req.body.id;
    let user = obj.users.filter(user => user.id == id)[0];
    if(!user)
        return res.status(404).end();
    let exist = (obj.queue.filter(user => user.id == id).length == 1);
    if(exist)
        return res.status(409).json({"error": "person is already in line"});
    try{
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
    let rawData = fs.readFileSync('./data/db.json');
    let obj = JSON.parse(rawData);
    let validator = validators.findPositionValidator.validate(req.body);
    if(validator.error)
        return res.status(400).json(validator.error.details);
    let email = req.body.email;
    let position = -1;
    for(let i = 0; i < obj.queue.length; i++){
        if(obj.queue[i].email == email){
            position = i + 1;
            break;
        }
    }
    if(position == -1)
        return res.status(404).end();
    try{
        return res.json(position);
    } catch {
        return res.status(500).end();
    }
});

routes.post('/filterLine', (req, res) => {
    let rawData = fs.readFileSync('./data/db.json');
    let obj = JSON.parse(rawData);
    let validator = validators.filterLineValidator.validate(req.body);
    if(validator.error)
        return res.status(400).json(validator.error.details);
    let gender = req.body.gender;
    let position = 1;
    obj = obj.queue.filter(user => {
        user.position = position++;
        delete user.id;
        return user.gender == gender;
    })
    try{
        return res.json(obj);
    } catch {
        return res.status(500).end();
    }
});

routes.post('/popLine', (req, res) => {
    let rawData = fs.readFileSync('./data/db.json');
    let obj = JSON.parse(rawData);
    if(obj.queue.length == 0)
        return res.status(403).json({"error": "queue is empty"});
    try{
        let user = obj.queue.shift();
        obj = JSON.stringify(obj, null, 4);
        fs.writeFileSync('./data/db.json', obj);
        return res.json(user);
    } catch {
        return res.status(500).end();
    }
    
});

module.exports = routes;