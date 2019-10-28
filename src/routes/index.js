const logger = require('../common/Logger')('src/routes/index.js');
const ejsRoutes = require('./ejsRoutes');
const uploadRoute = require('./uploadRoute');
const Backend = require('../service/Backend');

const salesProvider = Backend.SalesProvider;
const plaidProvider = Backend.PlaidProvider;

module.exports = app => {
  ejsRoutes(app);
  uploadRoute(app);
  app.post('/get_access_token', async (req, res) => {
    try {
      const token = req.body.public_token;
      const result = await plaidProvider.getAccessToken(token);
      res.json(result);
    } catch (e) {
      logger.error(e);
      res.status(500).json({ error: e });
    }
  });
  app.get('/auth/:accessToken', async (req, res) => {
    try {
      const { accessToken } = req.params;
      const result = await plaidProvider.getAuth(accessToken);
      res.json(result);
    } catch (e) {
      logger.error(e);
      res.status(500).json({ error: e });
    }
  });

  app.get('/transactions/:accessToken', async (req, res) => {
    // Pull transactions for the Item for the last 30 days
    try {
      const { accessToken } = req.params;
      const result = await plaidProvider.getTransactions(accessToken);
      res.json(result);
    } catch (e) {
      logger.error(e);
      res.status(500).json({ error: e });
    }
  });

  app.get('/identity/:accessToken', async (req, res) => {
    try {
      const { accessToken } = req.params;
      const result = await plaidProvider.getIdentity(accessToken);
      res.json(result);
    } catch (e) {
      logger.error(e);
      res.status(500).json({ error: e });
    }
  });

  app.get('/balance/:accessToken', async (req, res) => {
    try {
      const { accessToken } = req.params;
      const result = await plaidProvider.getBalance(accessToken);
      res.json(result);
    } catch (e) {
      logger.error(e);
      res.status(500).json({ error: e });
    }
  });

  app.get('/accounts/:accessToken', async (req, res) => {
    try {
      const { accessToken } = req.params;
      const result = await plaidProvider.getAccounts(accessToken);
      res.json(result);
    } catch (e) {
      logger.error(e);
      res.status(500).json({ error: e });
    }
  });

  app.get('/holdings/:accessToken', async (req, res) => {
    try {
      const { accessToken } = req.params;
      const result = await plaidProvider.getHoldings(accessToken);
      res.json(result);
    } catch (e) {
      logger.error(e);
      res.status(500).json({ error: e });
    }
  });

  app.get('/item/:accessToken', async (req, res) => {
    // Pull the Item - this includes information about available products,
    // billed products, webhook information, and more.
    try {
      const { accessToken } = req.params;
      const itemResponse = await plaidProvider.getItem(accessToken);
      const instRes = await plaidProvider.getInstitutionById(
        itemResponse.item.institution_id
      );
      const result = {
        item: itemResponse.item,
        institution: instRes.institution,
      };
      res.json(result);
    } catch (e) {
      logger.error(e);
      res.status(500).json({ error: e });
    }
  });

  app.get('/investment_transactions/:accessToken', async (req, res) => {
    try {
      const { accessToken } = req.params;
      const result = await plaidProvider.getInvestmentsTransactions(
        accessToken
      );
      res.json(result);
    } catch (e) {
      logger.error(e);
      res.status(500).json({ error: e });
    }
  });

  app.get('/assets/data/:publicToken', async (req, res) => {
    try {
      const { publicToken } = req.params;
      const authResult = await plaidProvider.getAccessToken(publicToken);
      const accessToken = authResult.access_token;
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

  app.get('/assets/:accessToken', async (req, res) => {
    try {
      const { accessToken } = req.params;
      const assetReportCreateResponse = await plaidProvider.getAssets(
        accessToken
      );
      const assetReportToken = assetReportCreateResponse.asset_report_token;
      const assetReportGetResponse = await plaidProvider.tryToGetAssetReport(
        assetReportToken
      );
      const [assetReportGetPdfResponse] = await Promise.all([
        plaidProvider.getAssetReportPdf(assetReportToken),
        salesProvider.pushReportData(assetReportGetResponse),
      ]);
      const result = {
        json: assetReportGetResponse.report,
        pdf: assetReportGetPdfResponse.buffer.toString('base64'),
      };
      res.json(result);
    } catch (e) {
      logger.error(e);
      res.status(500).json({ error: e });
    }
  });
};
