const path = require('path');
const logger = require('../common/Logger')('src/routes/index.js');
const SalesforceProvider = require('../service/SalesforceProvider');
const PlaidProvider = require('../service/PlaidProvider');

const salesProvider = new SalesforceProvider();
salesProvider.connect().then(() => {
  logger.info('Connection to salesforce established.');
});

const plaidProvider = new PlaidProvider();

const {
  PLAID_PUBLIC_KEY,
  PLAID_ENV,
  PLAID_PRODUCTS,
  PLAID_COUNTRY_CODES,
} = process.env;

module.exports = app => {
  const SRC_ROOT = path.resolve(__dirname, '..');
  app.set('views', path.join(SRC_ROOT, 'views'));
  app.set('view engine', 'ejs');
  app.get('/', (req, res) => {
    res.render('index', {
      title: 'Prototype',
      PLAID_PUBLIC_KEY,
      PLAID_ENV,
      PLAID_PRODUCTS,
      PLAID_COUNTRY_CODES,
    });
  });
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
      const assetReportGetPdfResponse = await plaidProvider.getAssetReportPdf(
        assetReportToken
      );
      await salesProvider.pushAssetsData(assetReportGetResponse);
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
