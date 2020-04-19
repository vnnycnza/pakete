'use strict';

const express = require('express');
const bodyparser = require('body-parser');

/**
 *
 * Class representing Server (API)
 * Contains methods used for
 * - initializing API
 * - starting API Server
 * - handlers for `/search`, `/packages`, `/authors`
 *
 * @class
 * @classdesc Server
 */
class Server {
  constructor(options) {
    this._host = options.config.host;
    this._port = options.config.port;
    this._models = options.models;
    this._app = express();
  }

  /**
   * Initializies server
   * Adds routes
   *
   * @returns {Promise}
   */
  async init() {
    console.info('[Server] Initializing server...');

    this._app.use(bodyparser.urlencoded({ extended: false }));
    this._app.use(bodyparser.json());

    this._app.get('/api/search', Server._validateParams, async (req, res) => {
      this._searchPackages(req, res);
    });
    this._app.get('/api/packages', async (req, res) => {
      this._getPackages(req, res);
    });
    this._app.get('/api/authors', async (req, res) => {
      this._getAuthors(req, res);
    });
    this._app.get('*', async (req, res) => {
      return res.status(404).json({ error: 'Not Found' });
    });
  }

  /**
   * Starts server
   * @returns {Promise}
   */
  async start() {
    this._app.listen(this._port, '0.0.0.0', () => {
      console.info(`[Server] Server is running on ${this._host}:${this._port}`);
    });
  }

  /**
   * Middleware for validating params
   * Only search route uses this which accepts `q` param
   * `q` should be a string, is required and should not be empty
   *
   * @param {Object} req
   * @param {Object} res
   * @param {Function} next
   * @returns {Promise}
   */
  static async _validateParams(req, res, next) {
    const { q } = req.query;
    return !q || q === '' || typeof q !== 'string'
      ? res.status(400).json({ error: 'Invalid search parameters' })
      : next();
  }

  /**
   * Handler Function for /search
   * Queries for packages based on `q`
   *
   * @param {Object} req
   * @param {Object} res
   * @returns {Promise}
   */
  async _searchPackages(req, res) {
    try {
      const { q } = req.query;
      let results = await this._models.package.searchPackageByName(q);
      if (results.length === 0) {
        return res.status(200).json({ packages: [] });
      }

      results = await this._getAuthorsAndFormatResults(results);

      return res.status(200).json({ packages: results });
    } catch (e) {
      console.error('[Server._searchPackages] Encountered error', e);
      return res
        .status(500)
        .json({ error: e.message || 'Internal Server Error' });
    }
  }

  /**
   * Handler Function for /packages
   * Queries for all packages
   *
   * @param {Object} req
   * @param {Object} res
   * @returns {Promise}
   */
  async _getPackages(req, res) {
    try {
      let results = await this._models.package.getAllPackagesJoinedInfo();
      if (results.length === 0) {
        return res.status(200).json({ packages: [] });
      }

      results = await this._getAuthorsAndFormatResults(results);

      return res.status(200).json({ packages: results });
    } catch (e) {
      console.error('[Server._getPackages] Encountered error', e);
      return res.status(500).json({ error: 'Internal Server Error' });
    }
  }

  /**
   * Handler Function for /authors
   * Queries for all authors
   *
   * @param {Object} req
   * @param {Object} res
   * @returns {Promise}
   */
  async _getAuthors(req, res) {
    try {
      const results = await this._models.author.getAllAuthors();
      return res.status(200).json({ authors: results });
    } catch (e) {
      console.error('[Server._getAuthors] Encountered error', e);
      return res.status(500).json({ error: 'Internal Server Error' });
    }
  }

  /**
   * Helper Function for retrieving authors
   * and formatting API response
   *
   * @param {Object[]} packageList
   * @returns {Promise}
   */
  async _getAuthorsAndFormatResults(packageList) {
    const packageInfoIds = packageList.map(r => r.package_info_id);
    const allAuthors = await this._models.packageAuthor.getAllPackageAuthorsByIds(
      packageInfoIds,
    );
    const authors = allAuthors.filter(a => a.type === 'author');
    const maintainers = allAuthors.filter(a => a.type === 'maintainer');

    return packageList.map(r => ({
      id: r.id,
      name: r.package,
      version: r.version,
      title: r.title,
      description: r.description,
      publication: r.publication,
      authors: authors
        .filter(a => a.package_info_id === r.package_info_id)
        .map(({ id, type, package_info_id, ...keepAttrs }) => keepAttrs),
      maintainers: maintainers
        .filter(a => a.package_info_id === r.package_info_id)
        .map(({ id, type, package_info_id, ...keepAttrs }) => keepAttrs),
    }));
  }
}

module.exports = Server;
