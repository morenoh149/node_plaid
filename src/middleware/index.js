const log4js = require('log4js');
const bodyParser = require('body-parser');
const cors = require('cors');

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
