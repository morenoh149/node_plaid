class HistoricalBalance {
  constructor(accountRaw) {
    this.account_id = accountRaw.account_id;
    this.historical_balances = accountRaw.historical_balances;
  }

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
