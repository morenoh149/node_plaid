const path = require('path');
const plaid = require('plaid');
const moment = require('moment');
const logger = require('../common/Logger')('src/routes/index.js');
const SalesfoceProvider = require('../service/SalesfoceProvider');

const salesProvider = new SalesfoceProvider();
salesProvider.connect().then(() => {
  logger.info('Connection to salesforce established.');
});

const {
  PLAID_CLIENT_ID,
  PLAID_SECRET,
  PLAID_PUBLIC_KEY,
  PLAID_ENV,
  PLAID_PRODUCTS,
  PLAID_COUNTRY_CODES,
} = process.env;

const respondWithAssetReport = (
  numRetriesRemaining,
  assetReportToken,
  client,
  response
) => {
  if (numRetriesRemaining === 0) {
    return response.json({
      error: 'Timed out when polling for Asset Report',
    });
  }

  const includeInsights = false;
  client.getAssetReport(
    assetReportToken,
    includeInsights,
    (error, assetReportGetResponse) => {
      if (error != null) {
        logger.warn(error);
        if (error.error_code === 'PRODUCT_NOT_READY') {
          setTimeout(
            () =>
              respondWithAssetReport(
                // eslint-disable-next-line no-param-reassign
                --numRetriesRemaining,
                assetReportToken,
                client,
                response
              ),
            1000
          );
          return;
        }

        return response.json({
          error,
        });
      }

      client.getAssetReportPdf(
        assetReportToken,
        (error, assetReportGetPdfResponse) => {
          if (error != null) {
            return response.json({
              error,
            });
          }

          response.json({
            error: null,
            json: assetReportGetResponse.report,
            pdf: assetReportGetPdfResponse.buffer.toString('base64'),
          });
        }
      );
    }
  );
};

const client = new plaid.Client(
  PLAID_CLIENT_ID,
  PLAID_SECRET,
  PLAID_PUBLIC_KEY,
  plaid.environments[PLAID_ENV],
  { version: '2019-05-29', clientApp: 'Plaid Prototype' }
);

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
  app.post('/get_access_token', (req, res) => {
    const token = req.body.public_token;
    client.exchangePublicToken(token, (error, tokenResponse) => {
      if (error) {
        logger.warn(error);
        return res.json({
          error,
        });
      }
      const ACCESS_TOKEN = tokenResponse.access_token;
      const ITEM_ID = tokenResponse.item_id;
      logger.debug(tokenResponse);
      return res.json({
        access_token: ACCESS_TOKEN,
        item_id: ITEM_ID,
      });
    });
  });
  app.get('/auth/:access_token', (req, res) => {
    const { access_token } = req.params;
    client.getAuth(access_token, (error, authResponse) => {
      if (error != null) {
        logger.warn(error);
        return res.json({
          error,
        });
      }
      logger.debug(authResponse);
      return res.json({ auth: authResponse });
    });
  });

  app.get('/transactions/:access_token', (req, res) => {
    // Pull transactions for the Item for the last 30 days
    const startDate = moment()
      .subtract(30, 'days')
      .format('YYYY-MM-DD');
    const endDate = moment().format('YYYY-MM-DD');
    const { access_token } = req.params;
    client.getTransactions(
      access_token,
      startDate,
      endDate,
      {
        count: 250,
        offset: 0,
      },
      (error, transactionsResponse) => {
        if (error != null) {
          logger.warn(error);
          return res.json({
            error,
          });
        }
        logger.debug(transactionsResponse);
        return res.json({ transactions: transactionsResponse });
      }
    );
  });

  app.get('/identity/:access_token', (req, res) => {
    const { access_token } = req.params;
    client.getIdentity(access_token, (error, identityResponse) => {
      if (error != null) {
        logger.warn(error);
        return res.json({
          error,
        });
      }
      logger.debug(identityResponse);
      return res.json({ identity: identityResponse });
    });
  });

  app.get('/balance/:access_token', (req, res) => {
    const { access_token } = req.params;
    client.getBalance(access_token, async (error, balanceResponse) => {
      if (error != null) {
        logger.warn(error);
        return res.json({
          error,
        });
      }
      logger.debug(balanceResponse);
      await salesProvider.balanceData(balanceResponse);
      return res.json({ balance: balanceResponse });
    });
  });

  app.get('/accounts/:access_token', (req, res) => {
    const { access_token } = req.params;
    client.getAccounts(access_token, (error, accountsResponse) => {
      if (error != null) {
        logger.warn(error);
        return res.json({
          error,
        });
      }
      logger.debug(accountsResponse);
      return res.json({ accounts: accountsResponse });
    });
  });

  app.get('/holdings/:access_token', (req, res) => {
    const { access_token } = req.params;
    client.getHoldings(access_token, (error, holdingsResponse) => {
      if (error != null) {
        logger.warn(error);
        return res.json({
          error,
        });
      }
      logger.debug(holdingsResponse);
      return res.json({ holdings: holdingsResponse });
    });
  });

  app.get('/item/:access_token', (req, res) => {
    // Pull the Item - this includes information about available products,
    // billed products, webhook information, and more.
    const { access_token } = req.params;
    client.getItem(access_token, (error, itemResponse) => {
      if (error != null) {
        logger.warn(error);
        return res.json({
          error,
        });
      }
      // Also pull information about the institution
      client.getInstitutionById(
        itemResponse.item.institution_id,
        (err, instRes) => {
          if (err != null) {
            const msg =
              'Unable to pull institution information from the Plaid API.';
            console.log(`${msg}\n${JSON.stringify(error)}`);
            return res.json({
              error: msg,
            });
          }
          logger.debug(itemResponse);
          return res.json({
            item: itemResponse.item,
            institution: instRes.institution,
          });
        }
      );
    });
  });

  app.get('/investment_transactions/:access_token', (req, res) => {
    const startDate = moment()
      .subtract(30, 'days')
      .format('YYYY-MM-DD');
    const { access_token } = req.params;
    const endDate = moment().format('YYYY-MM-DD');
    client.getInvestmentTransactions(
      access_token,
      startDate,
      endDate,
      (error, investmentTransactionsResponse) => {
        if (error != null) {
          logger.warn(error);
          return res.json({
            error,
          });
        }
        logger.debug(investmentTransactionsResponse);
        res.json({
          investment_transactions: investmentTransactionsResponse,
        });
      }
    );
  });

  app.get('/assets/:access_token', (req, res) => {
    // You can specify up to two years of transaction history for an Asset
    // Report.
    const daysRequested = 10;

    const { access_token } = req.params;

    // The `options` object allows you to specify a webhook for Asset Report
    // generation, as well as information that you want included in the Asset
    // Report. All fields are optional.
    const options = {
      client_report_id: 'Custom Report ID #123',
      // webhook: 'https://your-domain.tld/plaid-webhook',
      user: {
        client_user_id: 'Custom User ID #456',
        first_name: 'Alice',
        middle_name: 'Bobcat',
        last_name: 'Cranberry',
        ssn: '123-45-6789',
        phone_number: '555-123-4567',
        email: 'alice@example.com',
      },
    };
    client.createAssetReport(
      [access_token],
      daysRequested,
      options,
      (error, assetReportCreateResponse) => {
        if (error != null) {
          logger.warn(error);
          return res.json({
            error,
          });
        }
        logger.debug(assetReportCreateResponse);

        const assetReportToken = assetReportCreateResponse.asset_report_token;
        return respondWithAssetReport(20, assetReportToken, client, res);
      }
    );
  });
};
