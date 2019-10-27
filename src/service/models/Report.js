class Report {
  constructor(data) {
    this.asset_report_id__c = data.asset_report_id;
    this.client_report_id__c = data.client_report_id;
    this.date_generated__c = data.date_generated;
    this.days_requested__c = data.days_requeste;
  }

  /**
   * Create Salesforce "Plaid Report" using raw data
   * @param {Object} reportData
   * @returns {Report}
   */
  static getReport(reportData) {
    return new Report(reportData);
  }
}

module.exports = Report;
