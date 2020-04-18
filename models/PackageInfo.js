'use strict';

/**
 *
 * Class representing PackageInfoModel
 * @class
 * @classdesc Used for querying `package_info` table
 */
class PackageInfo {
  /**
   * Create PackageInfoModel
   * @param {Object} db - knex client instance
   */
  constructor(db) {
    this._db = db;
  }

  /**
   * Add to `package_info` table
   * Updates `packages`.`package_info_id` table identified by parameter packageId
   * `INSERT INTO package_info () VALUES ()`
   * `UPDATE packages SET package_info_id = <insertedId> WHERE id = <packageId>`
   *
   * @param {Integer} packageId - Package ID
   * @param {String} title - Package Title
   * @param {String} description - Package description
   * @param {String} publication - Package publication
   *
   * @returns {Integer} returns `package_info.id`
   */
  async createPackageInfo(packageId, title, description, publication) {
    try {
      const packageInfoId = await this._db('package_info').insert({
        title,
        description,
        publication,
      });

      await this._db('packages')
        .where({ id: packageId })
        .update({ package_info_id: packageInfoId[0] });

      return packageInfoId[0];
    } catch (e) {
      console.info('[DatabaseError.createPackageInfo]', e);
      let err = new Error('DatabaseError');
      err.details = { errorType: e.name, errorMsg: e.message };

      throw err;
    }
  }
}

module.exports = PackageInfo;
