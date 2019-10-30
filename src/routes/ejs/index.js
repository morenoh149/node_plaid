const path = require('path');
const env = require('env-var');

const PLAID_PUBLIC_KEY = env
  .get('PLAID_PUBLIC_KEY')
  .required()
  .asString();
const PLAID_ENV = env
  .get('PLAID_ENV')
  .required()
  .asString();
const PLAID_PRODUCTS = env
  .get('PLAID_PRODUCTS')
  .required()
  .asString();
const PLAID_COUNTRY_CODES = env
  .get('PLAID_COUNTRY_CODES')
  .required()
  .asString();

/**
 * Set EJS route for HTML responses.
 * @param app Express application
 */
module.exports = app => {
  const SRC_ROOT = path.resolve(__dirname, '..', '..');
  app.set('views', path.join(SRC_ROOT, 'views'));
  app.set('view engine', 'ejs');

  app.get('/', (req, res) => {
    res.render('index');
  });

  app.get('/bind/:userId', (req, res) => {
    const { userId } = req.params;
    res.render('bind', {
      title: 'Prototype: Plaid to Salesforce',
      PLAID_PUBLIC_KEY,
      PLAID_ENV,
      PLAID_PRODUCTS,
      PLAID_COUNTRY_CODES,
      userId,
    });
  });

  app.get('/api', (req, res) => {
    res.render('api', {
      title: 'Api testing',
      PLAID_PUBLIC_KEY,
      PLAID_ENV,
      PLAID_PRODUCTS,
      PLAID_COUNTRY_CODES,
    });
  });
};
