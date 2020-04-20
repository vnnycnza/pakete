'use strict';

const path = require('path');

module.exports = {
  development: {
    client: 'mysql',
    connection: {
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'pakete',
      password: process.env.DB_PW || 'pakete',
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
  teste2e: {
    client: 'mysql',
    connection: {
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'pakete',
      password: process.env.DB_PW || 'pakete',
      database: process.env.DB_NAME || 'pakete_test',
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
