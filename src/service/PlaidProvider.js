const plaid = require('plaid');
const moment = require('moment');
const logger = require('../common/Logger')('src/service/PlaidProvider.js');

const {
  PLAID_CLIENT_ID,
  PLAID_SECRET,
  PLAID_PUBLIC_KEY,
  PLAID_ENV,
} = process.env;

const MAX_ATTEMP_COUNT = 20;
const ASSET_REPORT_INCLUDE_INSIGHT = false;

const delay = async (timeout = 1000) => {
  return new Promise(resolve => {
    setTimeout(resolve, timeout);
  });
};

class PlaidProvider {
  constructor() {
    this.client = new plaid.Client(
      PLAID_CLIENT_ID,
      PLAID_SECRET,
      PLAID_PUBLIC_KEY,
      plaid.environments[PLAID_ENV],
      { version: '2019-05-29', clientApp: 'Plaid Prototype' }
    );
  }

  /**
   * Get access tokens
   * @param {string} token
   * @returns {Promise<Object>}
   */
  async getAccessToken(token) {
    return new Promise((resolve, reject) => {
      this.client.exchangePublicToken(token, (error, tokenResponse) => {
        if (error) {
          return reject(error);
        }
        const ACCESS_TOKEN = tokenResponse.access_token;
        const ITEM_ID = tokenResponse.item_id;
        logger.debug(tokenResponse);
        return resolve({
          access_token: ACCESS_TOKEN,
          item_id: ITEM_ID,
        });
      });
    });
  }

  /**
   * Get Auth data
   * @param {string} accessToken
   * @returns {Promise<Object>}
   */
  async getAuth(accessToken) {
    return new Promise((resolve, reject) => {
      this.client.getAuth(accessToken, (error, authResponse) => {
        if (error) {
          return reject(error);
        }
        logger.debug(authResponse);
        return resolve({ auth: authResponse });
      });
    });
  }

  /**
   *  Get transactions
   * @param {string} accessToken
   * @param {string|undefined} startDate
   * @param {string|undefined} endDate
   * @returns {Promise<Object>}
   */
  async getTransactions(
    accessToken,
    startDate = moment()
      .subtract(30, 'days')
      .format('YYYY-MM-DD'),
    endDate = moment().format('YYYY-MM-DD')
  ) {
    return new Promise((resolve, reject) => {
      this.client.getTransactions(
        accessToken,
        startDate,
        endDate,
        {
          count: 250,
          offset: 0,
        },
        (error, transactionsResponse) => {
          if (error) {
            return reject(error);
          }
          logger.debug(transactionsResponse);
          return resolve({ transactions: transactionsResponse });
        }
      );
    });
  }

  /**
   * Get identity
   * @param {string} accessToken
   * @returns {Promise<Object>}
   */
  async getIdentity(accessToken) {
    return new Promise((resolve, reject) => {
      this.client.getIdentity(accessToken, (error, identityResponse) => {
        if (error) {
          return reject(error);
        }
        logger.debug(identityResponse);
        return resolve({ identity: identityResponse });
      });
    });
  }

  /**
   * Get balance
   * @param {string} accessToken
   * @returns {Promise<Object>}
   */
  async getBalance(accessToken) {
    return new Promise((resolve, reject) => {
      this.client.getBalance(accessToken, async (error, balanceResponse) => {
        if (error) {
          return reject(error);
        }
        logger.debug(balanceResponse);
        return resolve({ balance: balanceResponse });
      });
    });
  }

  /**
   * Get Accounts
   * @param {string} accessToken
   * @returns {Promise<Object>}
   */
  async getAccounts(accessToken) {
    return new Promise((resolve, reject) => {
      this.client.getAccounts(accessToken, (error, accountsResponse) => {
        if (error) {
          return reject(error);
        }
        logger.debug(accountsResponse);
        return resolve({ accounts: accountsResponse });
      });
    });
  }

  /**
   * Get Holdings
   * @param {string} accessToken
   * @returns {Promise<Object>}
   */
  async getHoldings(accessToken) {
    return new Promise((resolve, reject) => {
      this.client.getHoldings(accessToken, (error, holdingsResponse) => {
        if (error) {
          return reject(error);
        }
        logger.debug(holdingsResponse);
        return resolve({ holdings: holdingsResponse });
      });
    });
  }

  /**
   * Get Item
   * @param {string} accessToken
   * @returns {Promise<Object>}
   */
  async getItem(accessToken) {
    return new Promise((resolve, reject) => {
      this.client.getItem(accessToken, (error, itemResponse) => {
        if (error) {
          return reject(error);
        }
        return resolve(itemResponse);
      });
    });
  }

  /**
   * Get Institution By Id
   * @param {string} id
   * @returns {Promise<Object>}
   */
  async getInstitutionById(id) {
    return new Promise((resolve, reject) => {
      this.client.getInstitutionById(id, (err, instRes) => {
        if (err) {
          const msg =
            'Unable to pull institution information from the Plaid API.';
          const error = `${msg}\n${JSON.stringify(err)}`;
          return reject(error);
        }
        logger.debug(instRes);
        return resolve(instRes);
      });
    });
  }

  /**
   *  Get Investment Transactions
   * @param {string} accessToken
   * @param {string|undefined} startDate
   * @param {string|undefined} endDate
   * @returns {Promise<Object>}
   */
  async getInvestmentsTransactions(
    accessToken,
    startDate = moment()
      .subtract(30, 'days')
      .format('YYYY-MM-DD'),
    endDate = moment().format('YYYY-MM-DD')
  ) {
    return new Promise((resolve, reject) => {
      this.client.getInvestmentTransactions(
        accessToken,
        startDate,
        endDate,
        (error, investmentTransactionsResponse) => {
          if (error) {
            return reject(error);
          }
          logger.debug(investmentTransactionsResponse);
          return resolve({
            investment_transactions: investmentTransactionsResponse,
          });
        }
      );
    });
  }

  /**
   * Get Assets
   * @param accessToken
   * @param {Number} daysRequested You can specify up to two years of transaction history for an Asset Report.
   * @param {Object|undefined} options The `options` object allows you to specify a webhook for Asset Report generation, as well as information that you want included in the Asset Report. All fields are optional.
   * @returns {Promise<Object>}
   */
  async getAssets(
    accessToken,
    daysRequested = 10,
    options = {
      client_report_id: 'Custom Report ID #123',
      // webhook: 'https://your-domain.tld/plaid-webhook',
      user: {
        client_user_id: 'Custom User ID #456',
        first_name: 'Alice',
        middle_name: 'Bobcat',
        last_name: 'Cranberry',
        ssn: '123-45-6789',
        phone_number: '555-123-4567',
        email: 'alice@example.com',
      },
    }
  ) {
    return new Promise((resolve, reject) => {
      this.client.createAssetReport(
        [accessToken],
        daysRequested,
        options,
        (error, assetReportCreateResponse) => {
          if (error) {
            return reject(error);
          }
          logger.debug(assetReportCreateResponse);
          return resolve(assetReportCreateResponse);
        }
      );
    });
  }

  /**
   * Try to get asset report. may throw error, if timeout.
   * @param {string} assetReportToken
   * @returns {Promise<Object>}
   */
  async tryToGetAssetReport(assetReportToken) {
    for (let attemp = 1; attemp < MAX_ATTEMP_COUNT; attemp += 1) {
      try {
        // eslint-disable-next-line no-await-in-loop
        return await this.getAssetReport(assetReportToken);
      } catch (e) {
        if (e.error_code === 'PRODUCT_NOT_READY') {
          // eslint-disable-next-line no-await-in-loop
          await delay();
        } else {
          throw e;
        }
      }
    }
    throw new Error('Timed out when polling for Asset Report');
  }

  /**
   * Get pdf for asset
   * @param {string} assetReportToken
   * @returns {Promise<Object>}
   */
  async getAssetReportPdf(assetReportToken) {
    return new Promise((resolve, reject) => {
      this.client.getAssetReportPdf(
        assetReportToken,
        (error, assetReportGetPdfResponse) => {
          if (error) {
            return reject(error);
          }
          return resolve(assetReportGetPdfResponse);
        }
      );
    });
  }

  /**
   * Try to get asset report. may throw error if not ready
   * @param {string} assetReportToken
   * @param {boolean|undefined} includeInsights
   * @returns {Promise<Object>}
   */
  async getAssetReport(
    assetReportToken,
    includeInsights = ASSET_REPORT_INCLUDE_INSIGHT
  ) {
    return new Promise((resolve, reject) => {
      this.client.getAssetReport(
        assetReportToken,
        includeInsights,
        (error, assetReportGetResponse) => {
          if (error) {
            return reject(error);
          }
          return resolve(assetReportGetResponse);
        }
      );
    });
  }
}

module.exports = PlaidProvider;
