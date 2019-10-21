const log4js = require('log4js');
const config = require('../config');

log4js.configure(config.log4js);

module.exports = category => log4js.getLogger(category);
