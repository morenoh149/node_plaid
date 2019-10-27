class Transaction {
  constructor(tranRaw) {
    this.account_id__c = tranRaw.account_id;
    this.amount__c = tranRaw.amount;
    this.date__c = tranRaw.date;
    this.origional_description__c = tranRaw.original_description;
    this.pending__c = tranRaw.pending;
    this.transaaction_id__c = tranRaw.transaction_id;
  }
}

module.exports = Transaction;
