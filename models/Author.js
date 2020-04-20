'use strict';

/**
 *
 * Class representing AuthorModel
 * @class
 * @classdesc Used for querying `authors` table
 */
class Author {
  /**
   * Create AuthorModel
   * @param {Object} db - knex client instance
   */
  constructor(db) {
    this._db = db;
  }

  /**
   * Adds multiple entries to `authors` table
   * `INSERT INTO authors () VALUES (....)`
   *
   * @param {Object[]} authors array of authors, obj must contain `name` and/or `email`
   * @returns {Promise}
   */
  async createAuthors(authors) {
    try {
      await this._db.batchInsert('authors', authors, 1000);
      return null;
    } catch (e) {
      console.info('[DatabaseError.createAuthors]', e);
      let err = new Error('DatabaseError');
      err.details = { errorType: e.name, errorMsg: e.message };

      throw err;
    }
  }

  /**
   * Retrieves all entries from `authors` table
   * `SELECT * FROM authors`
   *
   * @returns {Object[]} array of objects containing `id`, `name`, `email`
   */
  async getAllAuthors() {
    try {
      const authors = await this._db.select().table('authors');
      return authors.map(a => ({
        ...a,
        ...(a.email === null ? { email: '' } : { email: a.email }),
      }));
    } catch (e) {
      console.info('[DatabaseError.getAllAuthors]', e);
      let err = new Error('DatabaseError');
      err.details = { errorType: e.name, errorMsg: e.message };

      throw err;
    }
  }
}

module.exports = Author;
