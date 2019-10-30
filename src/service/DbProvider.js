const knex = require('../db');
const CryptoProvider = require('./CryptoProvider');

class DbProvider {
  static async SaveToken(token, userId) {
    const dbData = {
      token: CryptoProvider.encrypt(token),
      userId,
    };
    return knex('tokens').insert(dbData);
  }
}

module.exports = DbProvider;
