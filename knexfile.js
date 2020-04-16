'use strict';

const path = require('path');

module.exports = {
  development: {
    client: 'mysql',
    connection: {
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PW || '',
      database: process.env.DB_NAME || 'pakete',
    },
    pool: {
      min: 2,
      max: 10,
    },
    migrations: {
      directory: path.join(__dirname, 'db/migrations'),
      tableName: 'knex_migrations',
    },
  },
};
