module.exports = {
  /**
   * Logger common configuration
   */
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
  /**
   * Default express http port
   */
  express: {
    http_port: 3000,
  },
  cron: {
    /**
     * Schedule for daemon task
     */
    updateAssetsTask: {
      schedule: '0 0 */180 * * *',
    },
  },
};
