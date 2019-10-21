const path = require('path');

module.exports = app => {
  const SRC_ROOT = path.resolve(__dirname, '..');
  app.set('views', path.join(SRC_ROOT, 'views'));
  app.set('view engine', 'ejs');
  app.get('/', (req, res) => {
    res.render('index', { title: 'Prototype' });
  });
};
