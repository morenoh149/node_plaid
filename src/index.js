require('./common/dotEnv_proxy');
const express = require('express');
const middleware = require('./middleware');
const routes = require('./routes');
const config = require('./config');
const logger = require('./common/Logger')('src/index.js');

/**
 * Express application
 * @type {app}
 */
const app = express();

middleware(app, logger);
routes(app);

app.use(express.static('src/static'));

const httpPort = process.env.PORT || config.express.http_port;

app.listen(httpPort);
logger.info(`app running on port http://localhost:${httpPort} ...`);

module.exports = app;
