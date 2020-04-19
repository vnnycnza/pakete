'use strict';

const _ = require('lodash');
const Cran = require('../services/Cran');
const Package = require('../models/Package');

/**
 * Gets package list from CRAN Server
 * Parse & get package name & version
 * Save to database
 *
 * @returns {Promise}
 */
async function main() {
  let knex;

  try {
    // Get hrtime() just to track execution time
    const hrstart = process.hrtime();

    // Setup db connection, models & services
    const env = process.env.NODE_ENV || 'development';
    const dbConfig = require('../knexfile')[env];
    if (dbConfig) knex = require('knex')(dbConfig);

    const PackageModel = new Package(knex);
    const CranService = new Cran({
      maxItems: process.env.CRAN_PACKAGE_LIST_MAX,
    });

    // Query for the package list from CRAN & parse
    console.info('[Loader] Retrieving packages list from CRAN Server...');
    const list = await CranService.getPackageList();
    console.info(`[Loader] Retrieved ${list.length} packages`);

    // Just a check if no list is retrieved, exit
    if (list.length === 0) {
      const error = new Error('NotFound');
      error.details = 'No package list retrieved from CRAN';
      throw error;
    }

    // Load the packages to database
    console.info('[Loader] Saving packages to database...');
    const chunkedList = _.chunk(list, 1000);
    await Promise.all(
      chunkedList.map(async pkgs => PackageModel.createPackages(pkgs)),
    );
    console.info('[Loader] Successfully saved packages to database');

    // Destroy db connection
    if (knex) knex.destroy();

    // Log Execution Time
    const hrend = process.hrtime(hrstart);
    console.info(
      '[Loader] Execution time (hr): %ds %dms',
      hrend[0],
      hrend[1] / 1000000,
    );

    // Exit gracefully
    process.exit(0);
  } catch (e) {
    if (knex) knex.destroy();
    console.error('[Loader] Error encountered', e);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
} else {
  module.exports = main;
}
