const crypto = require('crypto');
const logger = require('../common/Logger')('src/service/CryptoProvider.js');

const ALGORITHM = 'aes-256-cbc';
const { CRYPTO_KEY, CRYPTO_IV } = process.env;
let cryptoKey;
let cryptoIv;

const WARN_MESSAGE = 'Crypto Key and Iv is not set. Encryption is disabled';
if (CRYPTO_KEY && CRYPTO_IV) {
  cryptoKey = Buffer.from(CRYPTO_KEY, 'base64');
  cryptoIv = Buffer.from(CRYPTO_IV, 'base64');
} else {
  logger.warn(WARN_MESSAGE);
}

class CryptoProvider {
  static encrypt(text) {
    if (!cryptoIv || !cryptoKey) {
      logger.warn(WARN_MESSAGE);
      return text;
    }
    const cipher = crypto.createCipheriv(
      ALGORITHM,
      Buffer.from(cryptoKey),
      cryptoIv
    );
    let encrypted = cipher.update(text);
    encrypted = Buffer.concat([encrypted, cipher.final()]);
    return encrypted.toString('base64');
  }

  static decrypt(text) {
    if (!cryptoIv || !cryptoKey) {
      logger.warn(WARN_MESSAGE);
      return text;
    }
    const encryptedText = Buffer.from(text, 'base64');
    const decipher = crypto.createDecipheriv(
      ALGORITHM,
      Buffer.from(cryptoKey),
      cryptoIv
    );
    let decrypted = decipher.update(encryptedText);
    decrypted = Buffer.concat([decrypted, decipher.final()]);
    return decrypted.toString();
  }
}

module.exports = CryptoProvider;
