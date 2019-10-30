const { CronJob } = require('cron');
const config = require('../config');
const logger = require('../common/Logger')('src/daemon/index.js');
require('../common/dotEnv_proxy');
const knex = require('../db');
const CryptoProvider = require('../service/CryptoProvider');
const Backend = require('../service/Backend');

logger.debug('Script is started.');

if (!CryptoProvider.isReady()) {
  logger.warn('Crypto provider is not able to decrypt data (PLAIN MODE)');
}

const processItem = async dbTokenObject => {
  try {
    logger.debug(`Processing: ${JSON.stringify(dbTokenObject)}`);
    const { token } = dbTokenObject;
    const decryptedToken = CryptoProvider.decrypt(token);
    await Backend.pushAssetsDataFromPlaidToSalesforce(decryptedToken);
    await knex('tokens')
      .update({
        updated_at: new Date(),
      })
      .where('id', dbTokenObject.id);
  } catch (e) {
    if (e.error_code === 'INVALID_ACCESS_TOKEN') {
      logger.warn(
        `Token (${dbTokenObject.token}) for user id: ${dbTokenObject.userId} (db id: ${dbTokenObject.id}) is INVALID. Updating flag on DB.`
      );
      await knex('tokens')
        .update({
          isValid: false,
          updated_at: new Date(),
        })
        .where('id', dbTokenObject.id);
    } else {
      logger.error(
        `Cron error, processing using token for user id: ${dbTokenObject.userId} (db id: ${dbTokenObject.id})`
      );
      logger.error(e);
    }
  }
  logger.debug('Processing finished.');
};

const main = async () => {
  logger.info('Main: invoked.');
  const validTokens = await knex('tokens')
    .select()
    .where('isValid', true);

  // The sequential order
  // eslint-disable-next-line no-restricted-syntax
  for (const tokenObject of validTokens) {
    // eslint-disable-next-line no-await-in-loop
    await processItem(tokenObject);
  }
};

const job = new CronJob(
  config.cron.updateAssetsTask.schedule,
  main,
  null,
  false,
  null,
  null,
  true
);
job.start();
