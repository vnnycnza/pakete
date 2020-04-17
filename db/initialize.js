'use strict';

const dbConfig = require('../knexfile');

/**
 * Creates database
 * @returns {Promise}
 */
async function main() {
  try {
    const { host, user, password } = dbConfig.development.connection;
    const knex = require('knex')({
      client: 'mysql',
      connection: {
        host,
        user,
        password,
      },
    });
    const { connection } = dbConfig.development;
    await knex.raw(`CREATE DATABASE IF NOT EXISTS ${connection.database}`);
    knex.destroy();
    process.exit(0);
  } catch (e) {
    console.log('Error creating database', e);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
} else {
  module.exports = main;
}
