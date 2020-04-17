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
   * Add to `authors` table
   * @param {String} name - Author Name
   * @param {String} email - Author Email
   * @returns {Object} object containing `id`, `name`, `email`
   */
  async createAuthor(name, email) {
    try {
      const authorId = await this._db('authors').insert({ name, email });
      const author = await this._db('authors').where('id', authorId[0]);
      return { ...author.shift() };
    } catch (e) {
      console.log('[DatabaseError]', e);
      throw new Error('DatabaseError', e);
    }
  }

  /**
   * Select from `authors` table by `id`
   * @param {Integer} id - Author ID
   * @returns {Object} object containing `id`, `name`, `email`
   */
  async getAuthorById(id) {
    try {
      const author = await this._db('authors').where('id', id);
      return { ...author.shift() };
    } catch (e) {
      console.log('[DatabaseError]', e);
      throw new Error('DatabaseError', e);
    }
  }

  /**
   * Retrieves all entries from `authors` table
   * @returns {Object[]} array of objects containing `id`, `name`, `email`
   */
  async getAllAuthors() {
    try {
      const authors = await this._db.select().table('authors');
      return authors.map(a => ({ ...a }));
    } catch (e) {
      console.log('[DatabaseError]', e);
      throw new Error('DatabaseError', e);
    }
  }
}

module.exports = Author;
