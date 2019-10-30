const log4js = require('log4js');
const config = require('../config');

log4js.configure(config.log4js);

/**
 * Generator for logging object
 * @param {string} category Logger will write using this category
 * @returns {Logger}
 */
module.exports = category => log4js.getLogger(category);
