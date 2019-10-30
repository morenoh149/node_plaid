const logger = require('../common/Logger')('src/routes/index.js');
const ejs = require('./ejs');
const uploadRoute = require('./upload');
const Backend = require('../service/Backend');
const DbProvider = require('../service/DbProvider');

const plaidProvider = Backend.PlaidProvider;

/**
 * Set all Express application routes
 * @param app Express application
 */
module.exports = app => {
  ejs(app);
  uploadRoute(app);

  /**
   * Main route. Used for binding data from Plaid to Salesforce and connect with userId
   */
  app.post('/assets/data', async (req, res) => {
    try {
      const { publicToken, userId } = req.body;
      const authResult = await plaidProvider.getAccessToken(publicToken);
      const accessToken = authResult.access_token;
      await DbProvider.SaveToken(accessToken, userId);
      const {
        assetReportGetResponse,
      } = await Backend.pushAssetsDataFromPlaidToSalesforce(accessToken);
      const result = {
        json: assetReportGetResponse.report,
      };
      res.json(result);
    } catch (e) {
      logger.error(e);
      res.status(500).json({ error: e });
    }
  });

  /**
   * Custom handler HTTP 404 error.
   */
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
