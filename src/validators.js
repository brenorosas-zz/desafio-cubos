const Joi = require('joi');

const findPositionValidator = Joi.object({
    email: Joi.string()
    .email({ minDomainSegments: 2, tlds: { allow: ["com", "net", "br"] } }).required()
})

const createUserValidator = Joi.object({
    name: Joi.string().required(),
    email: Joi.string()
        .email({ minDomainSegments: 2, tlds: { allow: ["com", "net", "br"] } }).required(),
    gender: Joi.string().required()
});

const addToLineValidator = Joi.object({
    id: Joi.number().required()
})

const filterLineValidator = Joi.object({
    gender: Joi.string().required()
})

module.exports = {findPositionValidator, createUserValidator, addToLineValidator, filterLineValidator};