const logger = require('../common/Logger')('src/routes/index.js');
const ejs = require('./ejs');
const uploadRoute = require('./upload');
const Backend = require('../service/Backend');
const DbProvider = require('../service/DbProvider');

const salesProvider = Backend.SalesProvider;
const plaidProvider = Backend.PlaidProvider;

module.exports = app => {
  ejs(app);
  uploadRoute(app);

  app.post('/assets/data', async (req, res) => {
    try {
      const { publicToken, userId } = req.body;
      const authResult = await plaidProvider.getAccessToken(publicToken);
      const accessToken = authResult.access_token;
      await DbProvider.SaveToken(accessToken, userId);
      const assetReportCreateResponse = await plaidProvider.getAssets(
        accessToken
      );
      const assetReportToken = assetReportCreateResponse.asset_report_token;
      const assetReportGetResponse = await plaidProvider.tryToGetAssetReport(
        assetReportToken
      );
      const [ret, assetReportGetPdfResponse] = await Promise.all([
        salesProvider.pushReportData(assetReportGetResponse),
        plaidProvider.getAssetReportPdf(assetReportToken),
        salesProvider.pushAccountData(assetReportGetResponse),
        salesProvider.pushHistoricalBalanceData(assetReportGetResponse),
        salesProvider.pushOwnersData(assetReportGetResponse),
        salesProvider.pushTransactionData(assetReportGetResponse),
      ]);
      // https://github.com/jsforce/jsforce/issues/43
      await salesProvider.uploadFileAsAttachment(
        ret.id,
        'AssetsReport.pdf',
        assetReportGetPdfResponse.buffer,
        'application/pdf'
      );
      const result = {
        json: assetReportGetResponse.report,
      };
      res.json(result);
    } catch (e) {
      logger.error(e);
      res.status(500).json({ error: e });
    }
  });

  app.use((req, res) => {
    res.status(404);

    // respond with html page
    if (req.accepts('html')) {
      return res.render('404', { url: req.url });
    }

    // respond with json
    if (req.accepts('json')) {
      return res.send({ error: 'Not found' });
    }

    // default to plain-text. send()
    return res.type('txt').send('Not found');
  });
};
