'use strict';

/**
 *
 * Class representing PackageModel
 * @class
 * @classdesc Used for querying `packages` table
 */
class Package {
  /**
   * Create PackageModel
   * @param {Object} db - knex client instance
   */
  constructor(db) {
    this._db = db;
  }

  /**
   * Add multiple entries to `packages` table
   * `INSERT INTO packages () VALUES (...)`
   *
   * @param {Object[]} pkgs array of pkgs, obj must contain `package` & `version`
   * @returns {Promise}
   */
  async createPackages(pkgs) {
    try {
      await this._db.batchInsert('packages', pkgs, 1000);
      return null;
    } catch (e) {
      console.info('[DatabaseError.createPackages]', e);
      let err = new Error('DatabaseError');
      err.details = { errorType: e.name, errorMsg: e.message };

      throw err;
    }
  }

  /**
   * Retrieves all entries from `packages` table
   * `SELECT * FROM packages` or `SELECT * FROM packages LIMIT <limit>`
   *
   * @param {Integer} limit number of items to retrieve
   * @returns {Object[]} array of objects containing `id`, `name`, `version`
   */
  async getAllPackages(limit) {
    try {
      const getPackages = limit
        ? this._db.select().table('packages').limit(limit)
        : this._db.select().table('packages');

      const packages = await getPackages;
      return packages.map(pkg => ({ ...pkg }));
    } catch (e) {
      console.info('[DatabaseError.getAllPackages]', e);
      let err = new Error('DatabaseError');
      err.details = { errorType: e.name, errorMsg: e.message };

      throw err;
    }
  }

  /**
   * Retrieves all packages with package info entries joined
   * `SELECT <...columns> FROM packages p RIGHT JOIN packages_info pi ON (p.packages_info_id = pi.id)`
   *
   * @returns {Object[]}
   */
  async getAllPackagesJoinedInfo() {
    try {
      const columnsToSelect = [
        'packages.id',
        'packages.package',
        'packages.version',
        'package_info.title',
        'package_info.description',
        'package_info.publication',
        'packages.package_info_id',
      ];

      const packages = await this._db
        .select(columnsToSelect)
        .from('packages')
        .rightJoin(
          'package_info',
          'packages.package_info_id',
          'package_info.id',
        );

      return packages.map(pkg => ({ ...pkg }));
    } catch (e) {
      console.info('[DatabaseError.getAllPackagesJoinedInfo]', e);
      let err = new Error('DatabaseError');
      err.details = { errorType: e.name, errorMsg: e.message };

      throw err;
    }
  }

  /**
   * Retrieves all packages with package info entries joined
   * With search parameter constraint
   * `SELECT <...columns> FROM packages p RIGHT JOIN packages_info pi `
   * `ON (p.packages_info_id = pi.id) WHERE p.search_name LIKE %<q>%`
   *
   * @param {String} q keyword to search
   * @returns {Object[]}
   */
  async searchPackageByName(q) {
    try {
      const columnsToSelect = [
        'packages.id',
        'packages.package',
        'packages.version',
        'package_info.title',
        'package_info.description',
        'package_info.publication',
        'packages.package_info_id',
      ];

      const packages = await this._db
        .select(columnsToSelect)
        .from('packages')
        .rightJoin(
          'package_info',
          'packages.package_info_id',
          'package_info.id',
        )
        .where('packages.search_name', 'like', `%${q}%`);

      return packages.map(pkg => ({ ...pkg }));
    } catch (e) {
      console.info('[DatabaseError.searchPackageByName]', e);
      let err = new Error('DatabaseError');
      err.details = { errorType: e.name, errorMsg: e.message };

      throw err;
    }
  }
}

module.exports = Package;
