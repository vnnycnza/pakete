'use strict';

const axios = require('axios');
const fs = require('fs');
const path = require('path');

/**
 *
 * Class representing CranService
 * Contains methods used for
 * - querying CRAN Server
 * - parsing data from CRAN Server
 * - downloading from CRAN Server
 *
 * @class
 * @classdesc CranService
 */
class Cran {
  constructor(config) {
    this._packagesUrl = config.pUrl;
    this._descriptionUrl = config.dUrl;
    this._packageDir = config.pDir;
    this._maxItems = parseInt(config.maxItems, 10);
  }

  /**
   * Creates CranError
   * @param {Object} details
   * @return {Object} Error Instance
   */
  static _createError(details) {
    let error = new Error('CranError');
    error = { ...error, ...details };
    return error;
  }

  /**
   * Calls PackageList URL
   * @return {String} response.data
   */
  async _getCranPackageList() {
    try {
      // HTTP GET Request to CRAN Server to retrieve package list
      const response = await axios.get(this._packagesUrl, {
        responseType: 'text',
      });

      // Catch non 200 errors
      if (response.status !== 200) {
        const errDetails = {
          details:
            '[CranService._getCranPackageList] ' +
            `Cran Server returned HTTP ${response.status}`,
          response,
        };
        throw Cran._createError(errDetails);
      }

      // Catch if no response data returned
      if (!response.data) {
        const errDetails = {
          details:
            '[CranService._getCranPackageList] No response data returned',
          response,
        };
        throw Cran._createError(errDetails);
      }

      return response.data;
    } catch (e) {
      let error = e;

      // Unexpected error on requesting
      if (error.name !== 'CranError') {
        error = Cran._createError({
          details:
            '[CranService._getCranPackageList] Request to Cran Server Failed',
          response: { errorType: e.name, errorMsg: e.message },
        });
      }

      console.error(
        `[CranError] Details: ${error.details} | Response: ${JSON.stringify(
          error.response,
        )}`,
      );

      throw error;
    }
  }

  /**
   * Parses the response text
   * @param {String} textList response text
   * @return {Object[]} array of objects with `package` & `version` properties
   */
  async _parsePackages(textList) {
    // Transform text to array split by new line
    const lines = textList.split('\n');

    let pkg = {};
    const list = [];
    const maxCount = this._maxItems;

    // Traverse each line to get package and version
    // Retrieves `this._maxItems` number of packages
    for (let i = 0; i < lines.length && list.length < maxCount; i += 1) {
      const line = lines[i];
      if (line.startsWith('Package:')) {
        pkg.package = line.substring(line.indexOf(':') + 1).trim();
        pkg.search_name = pkg.package.toLowerCase();
      }

      if (line.startsWith('Version:')) {
        pkg.version = line.substring(line.indexOf(':') + 1).trim();
        list.push(pkg);
        pkg = {};
      }
    }

    return list;
  }

  /**
   * Calls CranServer to get list of packages
   * Parses the response from server
   * Returns parsed response
   *
   * @return {Object[]} array of objects with `package` & `version` properties
   */
  async getPackageList() {
    try {
      const serverResponse = await this._getCranPackageList();
      const packageList = await this._parsePackages(serverResponse);
      return packageList;
    } catch (e) {
      let error = e;
      if (error.name !== 'CranError') {
        error = Cran._createError({
          details:
            '[CranService.getPackageList] Error encountered in parsing response',
          response: { errorType: e.name, errorMsg: e.message },
        });
      }

      console.error(
        `[CranError] Details: ${error.details} | Response: ${JSON.stringify(
          error.response,
        )}`,
      );

      throw error;
    }
  }

  /**
   * Downloads the package from CRAN Server
   *
   * @param {Object} p object representing package
   * @return {Promise}
   */
  async downloadPackage(p) {
    try {
      // Create destination directory for downloads
      if (!fs.existsSync(this._packageDir)) {
        fs.mkdirSync(this._packageDir);
      }

      const dirPath = path.join(
        this._packageDir,
        `${p.package}_${p.version}.tar.gz`,
      );

      const writer = fs.createWriteStream(dirPath);

      // Format download URL based on package name & version
      const url = this._descriptionUrl
        .replace('[PACKAGE_NAME]', p.package)
        .replace('[PACKAGE_VERSION]', p.version);

      // HTTP GET Request to CRAN Server
      const response = await axios.get(url, {
        responseType: 'stream',
      });

      // Catch non 200 response
      if (response.status !== 200) {
        const errDetails = {
          details:
            '[CranService.downloadPackage] ' +
            `Cran Server returned HTTP ${response.status}`,
          response,
        };
        throw Cran._createError(errDetails);
      }

      // Catch no response.data
      if (!response.data) {
        const errDetails = {
          details: '[CranService.downloadPackage] No response data returned',
          response,
        };
        throw Cran._createError(errDetails);
      }

      response.data.pipe(writer);

      return new Promise((resolve, reject) => {
        writer.on('finish', () => resolve());
        writer.on('error', () => reject());
      });
    } catch (e) {
      let error = e;
      if (error.name !== 'CranError') {
        error = Cran._createError({
          details: '[CranService.downloadPackage] Download package failed',
          response: { errorType: e.name, errorMsg: e.message },
        });
      }

      console.error(
        `[CranError] Details: ${error.details} | Response: ${JSON.stringify(
          error.response,
        )}`,
      );

      throw error;
    }
  }

  /**
   * Parses the DESCRIPTION file
   * @param {String} content
   * @return {Object} description details
   */
  static parseDescriptionFile(content) {
    // Transform response text to array split by new line
    const lines = content.split('\n');

    // Helper function for checking if next line is a new attribute
    // Assumption is if new line starts with a white space,
    // it a continuation of the previous line
    // Hence, this function "looks ahead" until next line is a new attribute
    const lookAhead = (currentIndex, val) => {
      let j = currentIndex + 1;
      let nextLine = lines[j];
      let moreThanOneLine = false;

      while (nextLine.startsWith(' ') && j < lines.length) {
        val += ' ' + nextLine.trim();
        j += 1;
        nextLine = lines[j];
      }

      // If we found that the next line is a continuation of the previous,
      // we advance our "main cursor" to where we are already
      if (j > currentIndex + 1) {
        moreThanOneLine = true;
      }

      return {
        lastIndex: moreThanOneLine ? j - 1 : currentIndex,
        value: val,
      };
    };

    let pkg = {};

    for (let i = 0; i < lines.length; i += 1) {
      const line = lines[i];

      // Get title
      if (line.startsWith('Title:')) {
        pkg.title = line.substring(line.indexOf(':') + 1).trim();
      }

      // Get description
      if (line.startsWith('Description:')) {
        let description = line.substring(line.indexOf(':') + 1).trim();

        // Usually description exceeds one line
        // Call helper function "lookAhead"
        const { lastIndex, value } = lookAhead(i, description);

        i = lastIndex;
        pkg.description = value;
      }

      // Get Date/Publication
      if (line.startsWith('Date/Publication:')) {
        pkg.publication = line.substring(line.indexOf(':') + 1).trim();
      }

      // Get Author
      if (line.startsWith('Author:')) {
        let author = line.substring(line.indexOf(':') + 1).trim();

        // Usually author also exceeds one line
        // Call helper function "lookAhead"
        const { lastIndex, value } = lookAhead(i, author);

        i = lastIndex;
        pkg.authors = Cran.sanitizeAuthors(value);
      }

      // Get Maintainer
      if (line.startsWith('Maintainer:')) {
        let maintainer = line.substring(line.indexOf(':') + 1).trim();

        // Usually maintainers also exceeds one line
        // Call helper function "lookAhead"
        const { lastIndex, value } = lookAhead(i, maintainer);

        i = lastIndex;
        pkg.maintainer = Cran.getNameAndEmail(value);
      }
    }

    return pkg;
  }

  /**
   * Sanitizes the author text retrieved
   * The author text is quite unpredicted but the better way
   * to get just the name is to remove anything inside `[]` or `<>`
   * and replace ` and ` and `&` by `,`
   * We then consider every string split by `,` as one author
   *
   * @param {String} authorText
   * @return {Object[]} array of objects with `name` property
   */
  static sanitizeAuthors(authorText) {
    const sAuthors = authorText
      .replace(/\[.*?\]/g, '')
      .replace(/<.*?>/g, '')
      .replace(/\(.*?\)/g, '')
      .replace(' and ', ',')
      .replace('&', ',');

    const aList = sAuthors.split(',').filter(s => s.trim() !== '');
    return aList.map(a => ({ name: a.trim() }));
  }

  /**
   * Formats the maintainer text retrieved
   * Most maintainer text format is as follows:
   * Some Name <somenameemail.com>
   * Used that as pattern to retrieve name & email
   *
   * @param {String} maintainerText
   * @return {Object} object with `name` and `email` property
   */
  static getNameAndEmail(maintainerText) {
    const emailMatch = maintainerText.match(/(<.*>)/);
    return {
      name: maintainerText.replace(emailMatch[0], '').trim(),
      email: emailMatch[0].replace(/[<>']+/g, '').trim() || '',
    };
  }
}

module.exports = Cran;
