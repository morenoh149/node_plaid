/**
 * Report object for storing data in Salesforce
 */
class Report {
  /**
   * Constructor will use raw Response data from plaid assets endpoint
   * @param data Raw response Data from plaid assets endpoint
   */
  constructor(data) {
    this.asset_report_id__c = data.asset_report_id;
    this.client_report_id__c = data.client_report_id;
    this.date_generated__c = data.date_generated;
    this.days_requested__c = data.days_requested;
  }
}

module.exports = Report;
