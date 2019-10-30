const log4js = require('log4js');
const bodyParser = require('body-parser');
const cors = require('cors');

/**
 * Set common middleware for Express application
 * @param app Express application
 * @param logger Logger object (hack for using with express)
 */
module.exports = (app, logger) => {
  app.use(
    log4js.connectLogger(logger, {
      level: 'auto',
      format: (req, res, format) =>
        format(
          ':remote-addr ":method :url HTTP/:http-version" :status :content-length ":referrer" ":user-agent"'
        ),
    })
  );
  app.use(bodyParser.urlencoded({ extended: true }));
  app.use(bodyParser.json());
  app.use(cors());
};
