class Owner {
  constructor(accountRaw) {
    this.account_id__c = accountRaw.account_id;
    this.ownersJsonStructure__c = JSON.stringify(accountRaw.owners);
  }
}

module.exports = Owner;
