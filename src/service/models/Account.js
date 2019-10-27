class Account {
  constructor(accountRaw) {
    this.account_id__c = accountRaw.account_id;
    this.balance_avaliable__c = accountRaw.balances.available;
    this.balance_current__c = accountRaw.balances.current;
    this.days_avaliable__c = accountRaw.days_available;
    this.mask__c = accountRaw.mask;
    this.name__c = accountRaw.name;
    this.official_name__c = accountRaw.official_name;
  }
}

module.exports = Account;
