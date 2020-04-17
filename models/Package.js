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
   * Add to `packages` table
   * @param {String} name - Package Name
   * @param {String} version - Package Version
   * @returns {Object} object containing `id`, `name`, `version`
   */
  async createPackage(name, version) {
    try {
      const packageId = await this._db('packages').insert({
        package: name,
        version,
      });
      const pkg = await this._db('packages').where('id', packageId[0]);
      return { ...pkg.shift() };
    } catch (e) {
      console.log('[DatabaseError]', e);
      throw new Error('DatabaseError', e);
    }
  }

  /**
   * Retrieves all entries from `packages` table
   * @returns {Object[]} array of objects containing `id`, `name`, `version`
   */
  async getAllPackages() {
    try {
      const packages = await this._db.select().table('packages');
      return packages.map(pkg => ({ ...pkg }));
    } catch (e) {
      console.log('[DatabaseError]', e);
      throw new Error('DatabaseError', e);
    }
  }
}

module.exports = Package;
