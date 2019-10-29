const knex = require('../db');
const CryptoProvider = require('./CryptoProvider');

class DbProvider {
  static async SaveToken(token, userId) {
    const ts = CryptoProvider.encrypt(token);
    const tv = CryptoProvider.decrypt(ts);
    const dbData = {
      token: CryptoProvider.encrypt(token),
      userId,
    };
    return knex('tokens').insert(dbData);
  }
}

module.exports = DbProvider;
