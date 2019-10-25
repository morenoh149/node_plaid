const jsforce = require('jsforce');
const env = require('env-var');
const logger = require('../common/Logger')('src/service/SalesforceProvider.js');

const SALESFORCE_USERNAME = env
  .get('SALESFORCE_USERNAME')
  .required()
  .asString();
const SALESFORCE_PASSWORD = env
  .get('SALESFORCE_PASSWORD')
  .required()
  .asString();
const SALESFORCE_SECURITY_TOKEN = env
  .get('SALESFORCE_SECURITY_TOKEN')
  .required()
  .asString();

class SalesforceProvider {
  constructor(options = {}) {
    this.conn = new jsforce.Connection(options);
  }

  // https://poanchen.github.io/blog/2018/08/27/how-to-fix-login-must-use-security-token-in-Salesforce
  // https://na114.lightning.force.com/lightning/setup/NetworkAccess/page?address=%2F05G
  /**
   * Connect to salesforce or throw error;
   * @returns {Promise<void>}
   */
  async connect() {
    return new Promise((resolve, reject) => {
      const { conn } = this;
      conn.login(
        SALESFORCE_USERNAME,
        SALESFORCE_PASSWORD + SALESFORCE_SECURITY_TOKEN,
        (err, userInfo) => {
          if (err) {
            return reject(err);
          }
          // Now you can get the access token and instance URL information.
          // Save them to establish connection next time.
          logger.log(`Access token: ${conn.accessToken}`);
          logger.log(`Instance url: ${conn.instanceUrl}`);
          // logged in user property
          logger.log(`User ID: ${userInfo.id}`);
          logger.log(`Org ID: ${userInfo.organizationId}`);
          return resolve();
        }
      );
    });
  }

  /**
   * Upload balance data to salesforce
   * @param {Array<any>} arr
   * @returns {Promise<object>}
   */
  async balanceData(arr) {
    const data = arr.accounts.map(acc => {
      const { account_id, balances } = acc;
      const { available } = balances;
      return {
        account_id__c: account_id,
        available__c: available,
      };
    });
    return new Promise((resolve, reject) => {
      this.conn.sobject('Balance__c').create(data, (err, ret) => {
        if (err) {
          return reject(err);
        }
        return resolve(ret);
      });
    });
  }

  /**
   * Push new data to salesforce
   * @param assetReportGetResponse
   * @returns {Promise<object>}
   */
  async pushAssetsData(assetReportGetResponse) {
    const { report } = assetReportGetResponse;
    const data = {
      asset_report_id__c: report.asset_report_id,
      client_report_id__c: report.client_report_id,
      date_generated__c: report.date_generated,
      days_requested__c: report.days_requested,
    };
    return new Promise((resolve, reject) => {
      this.conn.sobject('Plaid_Asset__c').create(data, (err, ret) => {
        if (err) {
          return reject(err);
        }
        return resolve(ret);
      });
    });
  }
}

module.exports = SalesforceProvider;
