const knex = require('../db');

class DbProvider {
  static async SaveToken(token, userId) {
    const dbData = {
      token,
      userId,
    };
    return knex('tokens').insert(dbData);
  }
}

module.exports = DbProvider;
