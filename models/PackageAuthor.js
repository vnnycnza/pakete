'use strict';

/**
 * Class representing PackageAuthorModel
 *
 * @class
 * @classdesc Used for querying `package_authors` table
 */
class PackageAuthor {
  /**
   * Create PackageAuthor
   * @param {Object} db - knex client instance
   */
  constructor(db) {
    this._db = db;
  }

  /**
   * Retrieves entries from `package_authors` table for specific package
   * `SELECT <...columns> FROM package_authors pa LEFT JOIN authors a `
   * `ON (pa.author_id = a.id) WHERE pa.package_info_id IN (<packageInfoIds>)`
   *
   * @param {Array} packageInfoIds Package Info ID
   * @returns {Object[]} array of objects containing `name`, `email`
   */
  async getAllPackageAuthorsByIds(packageInfoIds) {
    try {
      const columnsToSelect = [
        'authors.name',
        'authors.email',
        'package_authors.type',
        'package_authors.package_info_id',
      ];
      const packages = await this._db
        .select(columnsToSelect)
        .from('package_authors')
        .leftJoin('authors', 'package_authors.author_id', 'authors.id')
        .whereIn('package_authors.package_info_id', packageInfoIds);

      return packages.map(pkg => ({
        ...pkg,
        ...(pkg.email === null ? { email: '' } : { email: pkg.email }),
      }));
    } catch (e) {
      console.info('[DatabaseError.getAllPackageAuthorsByIds]', e);
      let err = new Error('DatabaseError');
      err.details = { errorType: e.name, errorMsg: e.message };

      throw err;
    }
  }

  /**
   * Add to `package_authors` table
   * `INSERT INTO package_authors () VALUES (....)`
   *
   * @param {Object[]} pkgAuthors - array of objs must contain `author_id` & `package_info_id` & `type`
   * @returns {Promise}
   */
  async createPackageAuthors(pkgAuthors) {
    try {
      await this._db.batchInsert('package_authors', pkgAuthors, 1000);
      return null;
    } catch (e) {
      console.info('[DatabaseError.createPackageAuthors]', e);
      let err = new Error('DatabaseError');
      err.details = { errorType: e.name, errorMsg: e.message };

      throw err;
    }
  }
}

module.exports = PackageAuthor;
