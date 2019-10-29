const Knex = require('knex');
const knexConfig = require('./knexfile');

const configType = process.env.NODE_ENV ? process.env.NODE_ENV : 'development';
const knex = Knex(knexConfig[configType]);
module.exports = knex;
