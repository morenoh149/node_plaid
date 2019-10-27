const SalesforceProvider = require('./SalesforceProvider');
const PlaidProvider = require('./PlaidProvider');
const logger = require('../common/Logger')('src/service/Backend.js');

class Backend {
  constructor() {
    this.salesProvider = new SalesforceProvider();
    this.plaidProvider = new PlaidProvider();
    this.isInit = false;
  }

  /**
   * Initialization
   * @returns {Promise<boolean>}
   */
  async init() {
    if (!this.isInit) {
      this.isInit = true;
      await this.salesProvider.connect();
      logger.info('Connection to salesforce established.');
    }
    return this.isInit;
  }

  /**
   * Get salesProvider
   * @returns {SalesforceProvider}
   */
  get SalesProvider() {
    return this.salesProvider;
  }

  /**
   * Get plaidProvider
   * @returns {PlaidProvider}
   */
  get PlaidProvider() {
    return this.plaidProvider;
  }
}

const singleton = new Backend();

module.exports = singleton;
