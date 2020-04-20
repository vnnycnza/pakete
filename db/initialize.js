'use strict';

const dbConfig = require('../knexfile');

/**
 * Creates database
 * @returns {Promise}
 */
async function main() {
  try {
    const env = process.env.NODE_ENV || 'development';
    const { host, user, password } = dbConfig[env].connection;
    const knex = require('knex')({
      client: 'mysql',
      connection: {
        host,
        user,
        password,
      },
    });
    const { connection } = dbConfig[env];
    await knex.raw(`CREATE DATABASE IF NOT EXISTS ${connection.database}`);
    console.info(`Created ${connection.database} database`);
    knex.destroy();
    process.exit(0);
  } catch (e) {
    console.info('Error creating database', e);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
} else {
  module.exports = main;
}
