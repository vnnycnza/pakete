'use strict';

const _ = require('lodash');
const Cran = require('../services/Cran');
const Package = require('../models/Package');

require('dotenv').config();

/**
 * Gets package list from CRAN Server
 * Parse & get package name & version
 * Save to database
 *
 * @returns {Promise}
 */
async function main() {
  try {
    // Get hrtime() just to track execution time
    const hrstart = process.hrtime();

    // Setup db connection, models & services
    const config = require('../knexfile');
    const knex = require('knex')(config.development);
    const PackageModel = new Package(knex);
    const CranService = new Cran({
      pUrl: process.env.CRAN_PACKAGE_LIST_URL,
      dUrl: process.env.CRAN_PACKAGE_DOWNLOAD_URL,
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
      chunkedList.map(async pkgs => {
        let response = await PackageModel.createPackages(pkgs);
        return response;
      }),
    );
    console.info('[Loader] Successfully saved packages to database');

    // Destroy db connection
    knex.destroy();

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
    console.error('[Loader] Error encountered', e);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
} else {
  module.exports = main;
}
