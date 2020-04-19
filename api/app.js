/**
 * Entrypoint
 * @module index.js
 */

'use strict';

const Author = require('../models/Author');
const Package = require('../models/Package');
const PackageAuthor = require('../models/PackageAuthor');
const PackageInfo = require('../models/PackageInfo');

const Server = require('./Server');

/**
 * Main Function
 * @returns {undefined}
 */
async function main() {
  const config = {
    app: {
      env: process.env.NODE_ENV || 'development',
      port: process.env.PORT || 3001,
      host: process.env.HOST || 'localhost',
    },
  };

  let knex;
  try {
    // Setup db connection & models
    const dbConfig = require('../knexfile');
    knex = require('knex')(dbConfig[config.app.env]);

    const AuthorModel = new Author(knex);
    const PackageModel = new Package(knex);
    const PackageInfoModel = new PackageInfo(knex);
    const PackageAuthorModel = new PackageAuthor(knex);

    // Create server instance
    const server = new Server({
      config: config.app,
      models: {
        author: AuthorModel,
        package: PackageModel,
        packageInfo: PackageInfoModel,
        packageAuthor: PackageAuthorModel,
      },
    });

    // Initialize & start server
    await server.init();
    await server.start();
  } catch (e) {
    console.error('[App] An error occured', e);
    if (knex) knex.destroy();
    process.exit(1);
  }
}

if (require.main === module) {
  main();
} else {
  module.exports = main;
}
