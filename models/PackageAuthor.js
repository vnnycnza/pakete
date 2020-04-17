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
   * Add to `package_authors` table where `type = author`
   * @param {Integer} authorId - Author ID
   * @param {Integer} packageInfoId - PackageInfo ID
   * @returns {Object} object containing `id`, `type`, `author_id`, `package_info_id`,
   */
  async createPackageAuthor(authorId, packageInfoId) {
    try {
      const pkgAuthorId = await this._db('package_authors').insert({
        author_id: authorId,
        package_info_id: packageInfoId,
        type: 'author',
      });
      const pkgAuthor = await this._db('package_authors').where(
        'id',
        pkgAuthorId[0],
      );
      return { ...pkgAuthor.shift() };
    } catch (e) {
      console.log('[DatabaseError]', e);
      throw new Error('DatabaseError', e);
    }
  }

  /**
   * Add to `package_authors` table where `type = maintainer`
   * @param {Integer} authorId - Author ID
   * @param {Integer} packageInfoId - PackageInfo ID
   * @returns {Object} object containing `id`, `type`, `author_id`, `package_info_id`,
   */
  async createPackageMaintainer(authorId, packageInfoId) {
    try {
      const pkgAuthorId = await this._db('package_authors').insert({
        author_id: authorId,
        package_info_id: packageInfoId,
        type: 'maintainer',
      });
      const pkgAuthor = await this._db('package_authors').where(
        'id',
        pkgAuthorId[0],
      );
      return { ...pkgAuthor.shift() };
    } catch (e) {
      console.log('[DatabaseError]', e);
      throw new Error('DatabaseError', e);
    }
  }

  /**
   * Retrieves entries from `package_authors` table for specific package
   * Populated by `authors`
   *
   * @param {Integer} packageInfoId Package Info ID
   * @returns {Object[]} array of objects containing `name`, `email`
   */
  async getAllPackageAuthorsById(packageInfoId) {
    try {
      const packages = await this._db
        .select(['name', 'email', 'type'])
        .from('package_authors')
        .leftJoin('authors', 'package_authors.author_id', 'authors.id')
        .where('package_info_id', packageInfoId);

      return packages.map(pkg => ({ ...pkg }));
    } catch (e) {
      console.log('[DatabaseError]', e);
      throw new Error('DatabaseError', e);
    }
  }
}

module.exports = PackageAuthor;
