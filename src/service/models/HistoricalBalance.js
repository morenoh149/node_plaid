/**
 * HistoricalBalance object for storing data in Salesforce
 */
class HistoricalBalance {
  /**
   * Constructor will use raw Account data from plaid assets endpoint
   * @param accountRaw Raw account Data from plaid assets endpoint
   */
  constructor(accountRaw) {
    this.account_id = accountRaw.account_id;
    this.historical_balances = accountRaw.historical_balances;
  }

  /**
   * Generating valid custom objects
   * @returns {Array<{current_balance__c: *, date__c: *, unofficial_currency_code__c: *, account_id__c: (*|string), iso_currency_code__c: *}>}
   * @constructor
   */
  get Balances() {
    return this.historical_balances.map(balance => {
      return {
        account_id__c: this.account_id,
        current_balance__c: balance.current,
        date__c: balance.date,
        iso_currency_code__c: balance.iso_currency_code,
        unofficial_currency_code__c: balance.unofficial_currency_code,
      };
    });
  }
}

module.exports = HistoricalBalance;
