'use strict';

const _ = require('lodash');
const fs = require('fs');
const path = require('path');

const Author = require('../models/Author');
const Package = require('../models/Package');
const PackageAuthor = require('../models/PackageAuthor');
const PackageInfo = require('../models/PackageInfo');

const Cran = require('../services/Cran');
const { getFileContentsFromTar } = require('../services/Utils');

/**
 * Queries database for the package list
 * Parses the packages for DESCRIPTION
 * Saves to database
 *
 * @returns {Promise}
 */
async function main() {
  let knex;

  try {
    // Get hrtime() just to track execution time
    const hrstart = process.hrtime();

    // Setup package directory, db connection & models
    const env = process.env.NODE_ENV || 'development';
    const dbConfig = require('../knexfile');
    knex = require('knex')(dbConfig[env]);
    const pkgDir = path.resolve(__dirname, '../.tmp/pkg');

    const AuthorModel = new Author(knex);
    const PackageModel = new Package(knex);
    const PackageInfoModel = new PackageInfo(knex);
    const PackageAuthorModel = new PackageAuthor(knex);

    // Query for package list from database
    console.info('[Parser] Retrieving packages list from database...');
    const list = await PackageModel.getAllPackages();

    // Quick check if there are loaded packages already
    if (list.length === 0) {
      const error = new Error('NotFound');
      error.details = 'No package list saved in database.';
      throw error;
    }

    // Quick check if directory exists
    if (!fs.existsSync(pkgDir)) {
      const error = new Error('NotFound');
      error.details = 'Downloaded Packages Directory does not exists';
      throw error;
    }

    // Add check here if dir does not exist, return
    console.info('[Parser] Parsing DESCRIPTION');
    const packageInfo = list.map(item => {
      const contents = getFileContentsFromTar(
        path.resolve(pkgDir, `${item.package}_${item.version}.tar.gz`),
        'DESCRIPTION',
      );

      const parsedValues = Cran.parseDescriptionFile(contents);
      return { ...item, ...parsedValues };
    });

    // Aggregate all authors and save to database
    const authors = packageInfo.map(p => p.authors).flat();
    const maintainers = packageInfo.map(p => p.maintainer);
    let allAuthors = _.uniqBy(maintainers.concat(authors), 'name');

    console.info(
      '[Parser] Aggregating authors & maintainers to save to database...',
    );
    const chunkedList = _.chunk(allAuthors, 1000);
    await Promise.all(
      chunkedList.map(async pkgs => {
        let response = await AuthorModel.createAuthors(pkgs);
        return response;
      }),
    );
    allAuthors = await AuthorModel.getAllAuthors();
    console.info('[Parser] Sucessfully authors to database');

    console.info('[Parser] Saving package info & updating packages...');
    const packageAuthorMapping = await Promise.all(
      packageInfo.map(async pkg => {
        const packageInfoId = await PackageInfoModel.createPackageInfo(
          pkg.id,
          pkg.title,
          pkg.description,
          pkg.publication,
        );

        const authorPkgMap = pkg.authors.map(a => {
          let authorId = _.find(allAuthors, { name: a.name }).id;
          return {
            author_id: authorId,
            package_info_id: packageInfoId,
            type: 'author',
          };
        });

        let maintainerId = _.find(allAuthors, { name: pkg.maintainer.name }).id;
        authorPkgMap.push({
          author_id: maintainerId,
          package_info_id: packageInfoId,
          type: 'maintainer',
        });

        return authorPkgMap;
      }),
    );
    console.info('[Parser] Successfully saved package info & updated package');

    console.info('[Parser] Saving package and author/maintainer mappings...');
    const chunkedPAList = _.chunk(packageAuthorMapping.flat(), 1000);
    await Promise.all(
      chunkedPAList.map(async pkgs =>
        PackageAuthorModel.createPackageAuthors(pkgs),
      ),
    );
    console.info('[Parser] Successfully saved mappings');

    // Clean up downloaded packages
    fs.rmdirSync(pkgDir, { recursive: true });

    // Destroy db connection
    knex.destroy();

    // Log Execution Time
    const hrend = process.hrtime(hrstart);
    console.info(
      '[Loader] Execution time (hr): %ds %dms',
      hrend[0],
      hrend[1] / 1000000,
    );

    // Exit Gracefully
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
