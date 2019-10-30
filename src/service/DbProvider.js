const knex = require('../db');
const CryptoProvider = require('./CryptoProvider');

/**
 * Minor handler for storing tokens in database.
 */
class DbProvider {
  /**
   * Save token for user
   * @param {string} token
   * @param {string} userId
   * @returns {Promise<void>}
   */
  static async SaveToken(token, userId) {
    const dbData = {
      token: CryptoProvider.encrypt(token),
      userId,
    };
    await knex('tokens').insert(dbData);
  }
}

module.exports = DbProvider;
