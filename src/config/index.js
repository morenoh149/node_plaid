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
  cron: {
    updateAssetsTask: {
      schedule: '0 0 */180 * * *',
    },
  },
};
