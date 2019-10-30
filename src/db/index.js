const Knex = require('knex');
const knexConfig = require('./knexfile');

/**
 * Default Database configuration ('development')
 * @type {string}
 */
const configType = process.env.NODE_ENV ? process.env.NODE_ENV : 'development';
const knex = Knex(knexConfig[configType]);

/**
 * Configured knex object for query building.
 * @type {Knex<any, unknown[]>}
 */
module.exports = knex;
