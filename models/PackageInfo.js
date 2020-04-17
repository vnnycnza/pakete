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
   *
   * @param {Integer} packageId - Package ID
   * @param {String} title - Package Title
   * @param {String} description - Package description
   * @param {String} publication - Package publication
   * @returns {Object} object containing `id`, `title`, `description`, `publication`
   */
  async createPackageInfo(packageId, title, description, publication) {
    try {
      const packageInfoId = await this._db('package_info').insert({
        title,
        description,
        publication,
      });

      const packageInfo = await this._db('package_info').where(
        'id',
        packageInfoId[0],
      );

      await this._db('packages')
        .where({ id: packageId })
        .update({ package_info_id: packageInfoId[0] });

      return { ...packageInfo.shift() };
    } catch (e) {
      console.log('[DatabaseError]', e);
      throw new Error('DatabaseError', e);
    }
  }
}

module.exports = PackageInfo;
