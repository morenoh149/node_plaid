const path = require('path');
require('../common/dotEnv_proxy');

const databaseFilename = path.resolve(__dirname, 'database.sqlite');

module.exports = {
  development: {
    client: 'sqlite3',
    connection: {
      filename: databaseFilename,
    },
    useNullAsDefault: true,
    migrations: {
      directory: './migrations',
      tableName: 'migrations',
    },
    seeds: {
      directory: './seeds',
    },
  },

  staging: {
    client: 'sqlite3',
    connection: {
      filename: databaseFilename,
    },
    useNullAsDefault: true,
    migrations: {
      directory: './migrations',
      tableName: 'migrations',
    },
    seeds: {
      directory: './seeds',
    },
  },

  production: {
    client: 'sqlite3',
    connection: {
      filename: databaseFilename,
    },
    useNullAsDefault: true,
    migrations: {
      directory: './migrations',
      tableName: 'migrations',
    },
    seeds: {
      directory: './seeds',
    },
  },

  test: {
    client: 'sqlite3',
    connection: {
      filename: databaseFilename,
    },
    useNullAsDefault: true,
    migrations: {
      directory: './migrations',
      tableName: 'migrations',
    },
    seeds: {
      directory: './seeds',
    },
  },
};
