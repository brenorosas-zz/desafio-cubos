const express = require("express");
const routes = express.Router();
const validators = require("./validators");
const fs = require("fs");
const funcionalities = require("./funcionalities.js");

routes.get("/showLine", async (req, res) => {
  try {
    let db = await funcionalities.readData();
    db.queue = db.queue.map((user, index) => {
      delete user.id;
      user.position = index + 1;
      return user;
    });
    return res.json(db.queue);
  } catch {
    return res.status(500).end();
  }
});

routes.post("/createUser", async (req, res) => {
  let validator = validators.createUserValidator.validate(req.body);
  if (validator.error) return res.status(400).json(validator.error.details);
  try {
    let db = await funcionalities.readData();
    let newUser = funcionalities.newUser(
      req.body.name,
      req.body.email,
      req.body.gender
    );
    newUser = Object.assign({ id: db.nextId }, newUser);
    let exist = db.users.some((user) => user.email == newUser.email);
    if (exist)
      return res.status(409).json({ error: "person is already registered" });
    db.nextId++;
    db.users.push(newUser);
    await funcionalities.writeData(db);
    return res.json(newUser);
  } catch {
    return res.status(500).end();
  }
});

routes.post("/addToLine", async (req, res) => {
  let validator = validators.addToLineValidator.validate(req.body);
  if (validator.error) return res.status(400).json(validator.error.details);
  try {
    let db = await funcionalities.readData();
    let id = req.body.id;
    let index = db.users.findIndex((user) => user.id == id);
    if (index == -1) return res.status(404).end();
    let exist = db.queue.some((user) => user.id == id);
    if (exist)
      return res.status(409).json({ error: "person is already in line" });
    let user = db.users[index];
    db.queue.push(user);
    let position = db.queue.length;
    await funcionalities.writeData(db);
    return res.json({ position: position });
  } catch {
    return res.status(500).end();
  }
});

routes.post("/findPosition", async (req, res) => {
  let validator = validators.findPositionValidator.validate(req.body);
  if (validator.error) return res.status(400).json(validator.error.details);
  try {
    let db = await funcionalities.readData();
    let email = req.body.email;
    let position = db.queue.findIndex((user) => user.email == email);
    if (position == -1) return res.status(404).end();
    return res.json({ position: position + 1 });
  } catch {
    return res.status(500).end();
  }
});

routes.post("/filterLine", async (req, res) => {
  let validator = validators.filterLineValidator.validate(req.body);
  if (validator.error) return res.status(400).json(validator.error.details);
  try {
    let db = await funcionalities.readData();
    let gender = req.body.gender;
    db = db.queue.filter((user, index) => {
      user.position = index + 1;
      delete user.id;
      return user.gender == gender;
    });
    return res.json(db);
  } catch {
    return res.status(500).end();
  }
});

routes.post("/popLine", async (req, res) => {
  try {
    let db = await funcionalities.readData();
    if (db.queue.length == 0)
      return res.status(400).json({ error: "queue is empty" });
    let user = db.queue.shift();
    await funcionalities.writeData(db);
    return res.json(user);
  } catch {
    return res.status(500).end();
  }
});

module.exports = routes;
