const jsforce = require('jsforce');
const env = require('env-var');
const Report = require('./models/Report');
const Account = require('./models/Account');
const HistoricalBalance = require('./models/HistoricalBalance');
const Owner = require('./models/Owner');
const Transaction = require('./models/Transaction');
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
   * Push accounts data to Salesforce
   * @param assetReportGetResponse
   * @returns {Promise<Object>}
   */
  async pushAccountData(assetReportGetResponse) {
    const { report } = assetReportGetResponse;
    const { items } = report;
    const accountsArr = items
      .map(item => {
        const { accounts } = item;
        return accounts.map(acc => new Account(acc));
      })
      .flat(1);
    return new Promise((resolve, reject) => {
      this.conn.sobject('Plaid_Account__c').create(accountsArr, (err, ret) => {
        if (err) {
          return reject(err);
        }
        return resolve(ret);
      });
    });
  }

  /**
   * Push balances data to Salesforce
   * @param assetReportGetResponse
   * @returns {Promise<Object>}
   */
  async pushHisoricalBalanceData(assetReportGetResponse) {
    const { report } = assetReportGetResponse;
    const { items } = report;
    const hBalancesArr = items
      .map(item => {
        const { accounts } = item;
        const balances = accounts.map(acc => new HistoricalBalance(acc));
        return balances.map(b => b.Balances).flat(1);
      })
      .flat(1);
    return new Promise((resolve, reject) => {
      this.conn
        .sobject('Plaid_Historical__c')
        .create(hBalancesArr, (err, ret) => {
          if (err) {
            return reject(err);
          }
          return resolve(ret);
        });
    });
  }

  /**
   * Push owners data to Salesforce
   * @param assetReportGetResponse
   * @returns {Promise<Object>}
   */
  async pushOwnersData(assetReportGetResponse) {
    const { report } = assetReportGetResponse;
    const { items } = report;
    const ownersArr = items
      .map(item => {
        const { accounts } = item;
        const owners = accounts.map(acc => new Owner(acc));
        return owners.flat(1);
      })
      .flat(1);
    return new Promise((resolve, reject) => {
      this.conn
        .sobject('Plaid_Account_Owner__c')
        .create(ownersArr, (err, ret) => {
          if (err) {
            return reject(err);
          }
          return resolve(ret);
        });
    });
  }

  /**
   * Push transactions data to Salesforce
   * @param assetReportGetResponse
   * @returns {Promise<Object>}
   */
  async pushTransactionData(assetReportGetResponse) {
    const { report } = assetReportGetResponse;
    const { items } = report;
    const transactionArr = items
      .map(item => {
        const { accounts } = item;
        return accounts
          .map(acc => acc.transactions.map(t => new Transaction(t)))
          .flat(1);
      })
      .flat(1);
    return new Promise((resolve, reject) => {
      this.conn
        .sobject('Plaid_Transaction__c')
        .create(transactionArr, (err, ret) => {
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
  async pushReportData(assetReportGetResponse) {
    const { report } = assetReportGetResponse;
    return new Promise((resolve, reject) => {
      this.conn
        .sobject('Plaid_Report__c')
        .create(Report.getReport(report), (err, ret) => {
          if (err) {
            return reject(err);
          }
          return resolve(ret);
        });
    });
  }

  /**
   * Create manual upload object for user_id
   * @param {string} userId
   * @returns {Promise<Object>}
   */
  async createManualUploadObject(userId) {
    return new Promise((resolve, reject) => {
      this.conn.sobject('Plaid_User_File__c').create(
        {
          user_id__c: userId,
        },
        (err, ret) => {
          if (err) {
            return reject(err);
          }
          return resolve(ret);
        }
      );
    });
  }

  /**
   * Upload file as attachment
   * @param {string} ParentId
   * @param {string} fileName
   * @param {Buffer} buffer
   * @param {string} ContentType
   * @param {string} [ObjectType=Attachment]
   * @returns {Promise<Object>}
   */
  async uploadFileAsAttachment(
    ParentId,
    fileName,
    buffer,
    ContentType,
    ObjectType = 'Attachment'
  ) {
    const base64data = buffer.toString('base64');
    return new Promise((resolve, reject) => {
      this.conn.sobject(ObjectType).create(
        {
          ParentId,
          Name: fileName,
          Body: base64data, // Base64
          ContentType,
        },
        (err, uploadedAttachment) => {
          if (err) {
            return reject(err);
          }
          return resolve(uploadedAttachment);
        }
      );
    });
  }
}

module.exports = SalesforceProvider;
