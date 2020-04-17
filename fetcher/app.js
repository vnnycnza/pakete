'use strict';

const Author = require('../models/Author');
const Package = require('../models/Package');
const PackageAuthor = require('../models/PackageAuthor');
const PackageInfo = require('../models/PackageInfo');

/**
 * @returns {Promise}
 */
async function main() {
  const config = require('../knexfile');
  const knex = require('knex')(config.development);
  const AuthorModel = new Author(knex);
  const PackageModel = new Package(knex);
  const PackageInfoModel = new PackageInfo(knex);
  const PackageAuthorModel = new PackageAuthor(knex);

  const a = await AuthorModel.createAuthor('Vanny', 'vanessa@smove.sg');
  const b = await PackageModel.createPackage('ABC', '1.0.0');
  const c = await PackageInfoModel.createPackageInfo(
    b.id,
    'ABC',
    'This is a sample package',
    new Date().toString(),
  );

  const d = await PackageAuthorModel.createPackageAuthor(a.id, c.id);
  const e = await PackageAuthorModel.createPackageMaintainer(a.id, c.id);

  const f = await PackageAuthorModel.getAllPackageAuthorsById(5);

  console.log(a, b, c, d, e, f);

  knex.destroy();
  process.exit(0);
}

if (require.main === module) {
  main();
} else {
  module.exports = main;
}
