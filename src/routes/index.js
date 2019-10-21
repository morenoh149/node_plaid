const path = require('path');
const plaid = require('plaid');

const { PLAID_CLIENT_ID } = process.env;
const { PLAID_SECRET } = process.env;
const { PLAID_PUBLIC_KEY } = process.env;
const { PLAID_ENV } = process.env;

const { PLAID_PRODUCTS } = process.env;

// PLAID_PRODUCTS is a comma-separated list of countries for which users
// will be able to select institutions from.
const { PLAID_COUNTRY_CODES } = process.env;

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
};
