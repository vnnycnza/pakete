'use strict';

const tar = require('tar');
const path = require('path');

module.exports = {
  /**
   * Helper Function to read contents of tar file
   * @param {String} tarFile
   * @param {String} desiredFile
   * @return {String} Contents of the desiredFile
   */
  getFileContentsFromTar: (tarFile, desiredFile) => {
    const data = [];
    const dir = path.basename(tarFile, '.tar.gz');
    const onentry = entry => {
      if (entry.path === `${dir.split('_')[0]}/${desiredFile}`) {
        entry.on('data', c => data.push(c));
      }
    };

    tar.t({ onentry, file: tarFile, sync: true });
    const buf = Buffer.concat(data);
    return buf.toString('utf8');
  },
};
