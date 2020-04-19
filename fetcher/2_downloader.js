'use strict';

const _ = require('lodash');
const path = require('path');
const Cran = require('../services/Cran');
const Package = require('../models/Package');

/**
 * Queries database for the package list
 * Attempts to try and download packages
 * Number of pkgs to download based on env var
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
    const pkgDir = path.resolve(__dirname, '../.tmp/pkg');

    const PackageModel = new Package(knex);
    const CranService = new Cran({ pDir: pkgDir });

    // Query for package list from database
    console.info('[Downloader] Retrieving packages list from database..');
    const list = await PackageModel.getAllPackages();

    // Just a check if there are loaded packages already
    if (list.length === 0) {
      const error = new Error('NotFound');
      error.details = 'No package list saved in database.';
      throw error;
    }

    // Downloads pkgs, 10 parallel downloads at a time
    console.info('[Downloader] Downloading Packages from CRAN...');
    let count = 0;
    const chunkedListForDownload = _.chunk(list, 10);
    for (let chunkL of chunkedListForDownload) {
      await Promise.all(chunkL.map(c => CranService.downloadPackage(c)));
      count += chunkL.length;
      console.info(`[Downloader] Downloaded ${count} packages`);
    }
    console.info('[Downloader] Sucessfully downloaded pkgs');

    // Destroy db connection
    if (knex) knex.destroy();

    // Log Execution Time
    const hrend = process.hrtime(hrstart);
    console.info(
      '[Downloader] Execution time (hr): %ds %dms',
      hrend[0],
      hrend[1] / 1000000,
    );

    // Exit Gracefully
    process.exit(0);
  } catch (e) {
    if (knex) knex.destroy();
    console.error('[Downloader] Error encountered', e);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
} else {
  module.exports = main;
}
