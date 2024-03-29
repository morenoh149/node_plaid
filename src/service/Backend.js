const SalesforceProvider = require('./SalesforceProvider');
const PlaidProvider = require('./PlaidProvider');
const logger = require('../common/Logger')('src/service/Backend.js');

/**
 * Handler for all app services
 */
class Backend {
  /**
   * Create Backend services
   */
  constructor() {
    this.salesProvider = new SalesforceProvider();
    this.plaidProvider = new PlaidProvider();
    this.isInit = false;
  }

  /**
   * Initialize Backend services
   * @returns {Promise<boolean>} Returns init state
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

  /**
   * Main app code. Process and bind plaid data to Salesforce
   * @param {string} token User auth token
   * @returns {Promise<{assetReportGetResponse: *, assetReportCreateResponse: *}>}
   */
  async pushAssetsDataFromPlaidToSalesforce(token) {
    const assetReportCreateResponse = await this.plaidProvider.getAssets(token);
    const assetReportToken = assetReportCreateResponse.asset_report_token;
    const assetReportGetResponse = await this.plaidProvider.tryToGetAssetReport(
      assetReportToken
    );
    const [ret, assetReportGetPdfResponse] = await Promise.all([
      this.salesProvider.pushReportData(assetReportGetResponse),
      this.plaidProvider.getAssetReportPdf(assetReportToken),
      this.salesProvider.pushAccountData(assetReportGetResponse),
      this.salesProvider.pushHistoricalBalanceData(assetReportGetResponse),
      this.salesProvider.pushOwnersData(assetReportGetResponse),
      this.salesProvider.pushTransactionData(assetReportGetResponse),
    ]);
    // https://github.com/jsforce/jsforce/issues/43
    await this.salesProvider.uploadFileAsAttachment(
      ret.id,
      'AssetsReport.pdf',
      assetReportGetPdfResponse.buffer,
      'application/pdf'
    );
    return {
      assetReportCreateResponse,
      assetReportGetResponse,
    };
  }
}

/**
 * Singleton
 * @type {Backend}
 */
const singleton = new Backend();
singleton.init().then(() => logger.info('Backend ready.'));

/**
 * Backend Singleton
 * @type {Backend}
 */
module.exports = singleton;
