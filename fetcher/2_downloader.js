'use strict';

const _ = require('lodash');
const path = require('path');
const Cran = require('../services/Cran');
const Package = require('../models/Package');

require('dotenv').config();

/**
 * Queries database for the package list
 * Attempts to try and download packages
 * Number of pkgs to download based on env var
 * Max Limit is manually set to 100
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
    const pkgDir = path.resolve(__dirname, '../.tmp/pkg');
    const PackageModel = new Package(knex);
    const CranService = new Cran({
      pUrl: process.env.CRAN_PACKAGE_LIST_URL,
      dUrl: process.env.CRAN_PACKAGE_DOWNLOAD_URL,
      pDir: pkgDir,
    });

    let max = parseInt(process.env.DOWNLOAD_SIZE, 10);
    max = !max || max > 100 ? 100 : max;

    // Query for package list from database
    console.info('[Downloader] Retrieving packages list from database..');
    const list = await PackageModel.getAllPackages(max);

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
    knex.destroy();

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
    console.error('[Downloader] Error encountered', e);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
} else {
  module.exports = main;
}