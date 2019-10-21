module.exports = {
  log4js: {
    appenders: {
      out: {
        type: 'stdout',
      },
    },
    categories: {
      default: {
        appenders: ['out'],
        level: 'debug',
      },
    },
  },
  express: {
    http_port: 3000,
  },
};
