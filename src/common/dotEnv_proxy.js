const path = require('path');

/**
 * The full path to the file with variables.
 * @type {string}
 */
const envFilePath = path.resolve(__dirname, '..', '..', '.env');
/**
 * Parsing `.env` file
 * @type {DotenvConfigOutput}
 */
const dotParsingResult = require('dotenv').config({ path: envFilePath });
const logger = require('./Logger')('src/common/dotEnv_proxy.js');

/**
 * Check parsing result.
 */
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
