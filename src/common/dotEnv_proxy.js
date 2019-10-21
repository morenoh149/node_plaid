const path = require('path');

const envFilePath = path.resolve(__dirname, '..', '..', '.env');
const dotParsingResult = require('dotenv').config({ path: envFilePath });
const logger = require('./Logger')('src/common/dotEnv_proxy.js');

if (dotParsingResult.error) {
  if (dotParsingResult.error.code === 'ENOENT') {
    logger.debug('Environment file do not exist. Skipping.');
  } else {
    logger.warn(
      'Unexpected dotenv: (%s)',
      JSON.stringify(dotParsingResult.error)
    );
  }
}
