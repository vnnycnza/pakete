'use strict';

const tar = require('tar');
const Utils = require('../../../services/Utils');

jest.mock('tar');

describe('[ Services - Utils ]', () => {
  describe('{ getFileContentsFromTar }', () => {
    test('{ should call tar.t once with correct values }', () => {
      Utils.getFileContentsFromTar('sample_1.0.1.tar.gz', 'DESCRIPTION');
      expect(tar.t).toHaveBeenCalledTimes(1);
      expect(tar.t).toHaveBeenCalledWith({
        onentry: expect.any(Function),
        file: 'sample_1.0.1.tar.gz',
        sync: true,
      });
    });
  });
});
