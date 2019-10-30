/**
 * Owner object for storing data in Salesforce
 */
class Owner {
  /**
   * Constructor will use raw Account data from plaid assets endpoint
   * @param accountRaw Raw account Data from plaid assets endpoint
   */
  constructor(accountRaw) {
    this.account_id__c = accountRaw.account_id;
    this.ownersJsonStructure__c = JSON.stringify(accountRaw.owners);
  }
}

module.exports = Owner;
