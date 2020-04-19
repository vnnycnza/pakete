'use strict';

const axios = require('axios');
const events = require('events');
const fs = require('fs');
const Cran = require('../../../services/Cran');

jest.mock('axios');
jest.mock('fs');

describe('[ Services - Cran ]', () => {
  describe('{ constructor }', () => {
    let service;

    beforeEach(() => {
      service = new Cran({
        pDir: '.tmp/pkg',
        maxItems: 50,
      });
    });

    test('{ should have correct packagesUrl }', () => {
      expect(service._packagesUrl).toEqual(
        'https://cran.r-project.org/src/contrib/PACKAGES',
      );
    });

    test('{ should have correct descriptionUrl }', () => {
      expect(service._descriptionUrl).toEqual(
        'https://cran.r-project.org/src/contrib/[PACKAGE_NAME]_[PACKAGE_VERSION].tar.gz',
      );
    });

    test('{ should have correct packageDir }', () => {
      expect(service._packageDir).toEqual('.tmp/pkg');
    });

    test('{ should have correct maxItems }', () => {
      expect(service._maxItems).toEqual(50);
    });

    test('{ should have maxItems = 10 when none is passed }', () => {
      service = new Cran({});
      expect(service._maxItems).toEqual(10);
    });
  });

  describe('{ _createError }', () => {
    test('{ should return instance of Error }', () => {
      const err = Cran._createError();
      expect(err).toBeInstanceOf(Error);
    });

    test('{ should return CranError }', () => {
      const err = Cran._createError();
      expect(err.message).toEqual('CranError');
    });

    test('{ should attach err details if provided }', () => {
      const err = Cran._createError({ a: 'some error' });
      expect(err.details).toEqual({ a: 'some error' });
    });
  });

  describe('{ _getCranPackageList }', () => {
    let service;

    beforeEach(() => {
      service = new Cran({ pDir: '.tmp/pkg' });
      axios.get.mockReturnValue({
        status: 200,
        data: 'sample',
      });
    });

    test('{ should call `axios.get` once with package url & responseType = text }', async () => {
      await service._getCranPackageList();
      expect(axios.get).toHaveBeenCalledTimes(1);
      expect(
        axios.get,
      ).toHaveBeenCalledWith(
        'https://cran.r-project.org/src/contrib/PACKAGES',
        { responseType: 'text' },
      );
    });

    test('{ should return response.data }', async () => {
      const response = await service._getCranPackageList();
      expect(response).toEqual('sample');
    });

    test('{ should throw CranError when response status is not 200 }', async () => {
      axios.get.mockReturnValue({ status: 400 });

      try {
        await service._getCranPackageList();
      } catch (e) {
        expect(e.message).toEqual('CranError');
        expect(e.details).toEqual({
          d: '[CranService._getCranPackageList] Cran Server returned HTTP 400',
          r: { status: 400 },
        });
      }
    });

    test('{ should throw CranError when response.data is null or undefined }', async () => {
      axios.get.mockReturnValue({ status: 200 });

      try {
        await service._getCranPackageList();
      } catch (e) {
        expect(e.message).toEqual('CranError');
        expect(e.details).toEqual({
          d: '[CranService._getCranPackageList] No response data returned',
          r: { status: 200 },
        });
      }
    });

    test('{ should throw CranError when unexpected error is thrown }', async () => {
      axios.get.mockRejectedValue(new Error('Some Error'));

      try {
        await service._getCranPackageList();
      } catch (e) {
        expect(e.message).toEqual('CranError');
        expect(e.details).toEqual({
          d: '[CranService._getCranPackageList] Request to Cran Server Failed',
          r: { errorType: 'Error', errorMsg: 'Some Error' },
        });
      }
    });

    test('{ should log error }', async () => {
      axios.get.mockRejectedValue(new Error('Some Error'));

      try {
        await service._getCranPackageList();
      } catch (e) {
        expect(consoleErrorSpy).toHaveBeenCalledTimes(1);
      }
    });
  });

  describe('{ _parsePackages }', () => {
    let service;
    let sampleText;

    beforeEach(() => {
      service = new Cran({ pDir: '.tmp/pkg' });
      sampleText =
        'Package: A3\n' +
        'Version: 1.0.0\n' +
        'Depends: R (>= 2.15.0), xtable, pbapply\n\n' +
        'Package: aaSEA\n' +
        'Version: 1.1.0\n' +
        'Depends: R(>= 3.4.0)\n\n' +
        'Package: abc\n' +
        'Version: 1.1.0\n' +
        'Depends: R(>= 3.4.0)\n\n' +
        'Package: AbCd\n' +
        'Version: 1.3.0\n' +
        'Depends: R(>= 3.4.0)\n\n';
    });

    test('{ should parse correctly and return package, version & search_name }', async () => {
      const list = service._parsePackages(sampleText);
      expect(new Set(list)).toEqual(
        new Set([
          { package: 'A3', version: '1.0.0', search_name: 'a3' },
          { package: 'aaSEA', version: '1.1.0', search_name: 'aasea' },
          { package: 'abc', version: '1.1.0', search_name: 'abc' },
          { package: 'AbCd', version: '1.3.0', search_name: 'abcd' },
        ]),
      );
    });
  });

  describe('{ _getDownloadLink }', () => {
    let service;

    beforeEach(() => {
      service = new Cran({ pDir: '.tmp/pkg' });
    });

    test('{ should parse correct and return package, version & search_name }', async () => {
      const link = service._getDownloadLink('abc', '1.2.3');
      expect(link).toEqual(
        'https://cran.r-project.org/src/contrib/abc_1.2.3.tar.gz',
      );
    });
  });

  describe('{ getPackageList }', () => {
    let sampleText;
    let service;

    beforeEach(() => {
      service = new Cran({ pDir: '.tmp/pkg' });
      sampleText =
        'Package: A3\n' +
        'Version: 1.0.0\n' +
        'Depends: R (>= 2.15.0), xtable, pbapply\n\n' +
        'Package: aaSEA\n' +
        'Version: 1.1.0\n' +
        'Depends: R(>= 3.4.0)\n\n' +
        'Package: abc\n' +
        'Version: 1.1.0\n' +
        'Depends: R(>= 3.4.0)\n\n' +
        'Package: AbCd\n' +
        'Version: 1.3.0\n' +
        'Depends: R(>= 3.4.0)\n\n';

      axios.get.mockReturnValue({
        status: 200,
        data: sampleText,
      });

      jest.spyOn(service, '_getCranPackageList');
      jest.spyOn(service, '_parsePackages');
      jest.spyOn(service, '_getDownloadLink');
    });

    test('{ should call _getCranPackageList once }', async () => {
      await service.getPackageList();
      expect(service._getCranPackageList).toHaveBeenCalledTimes(1);
    });

    test('{ should call _parsePackages once }', async () => {
      await service.getPackageList();
      expect(service._parsePackages).toHaveBeenCalledTimes(1);
    });

    test('{ should call _getDownloadLink for every package parsed }', async () => {
      await service.getPackageList();
      expect(service._getDownloadLink).toHaveBeenCalledTimes(4);
    });

    test('{ should return object with package details }', async () => {
      const list = await service.getPackageList(sampleText);
      expect(new Set(list)).toEqual(
        new Set([
          {
            package: 'A3',
            version: '1.0.0',
            search_name: 'a3',
            download_link:
              'https://cran.r-project.org/src/contrib/A3_1.0.0.tar.gz',
          },
          {
            package: 'aaSEA',
            version: '1.1.0',
            search_name: 'aasea',
            download_link:
              'https://cran.r-project.org/src/contrib/aaSEA_1.1.0.tar.gz',
          },
          {
            package: 'abc',
            version: '1.1.0',
            search_name: 'abc',
            download_link:
              'https://cran.r-project.org/src/contrib/abc_1.1.0.tar.gz',
          },
          {
            package: 'AbCd',
            version: '1.3.0',
            search_name: 'abcd',
            download_link:
              'https://cran.r-project.org/src/contrib/AbCd_1.3.0.tar.gz',
          },
        ]),
      );
    });

    test('{ should throw CranError when error is encountered }', async () => {
      service._getCranPackageList = jest
        .fn()
        .mockRejectedValue(new Error('Some Error'));

      try {
        await service.getPackageList();
      } catch (e) {
        expect(e.message).toEqual('CranError');
        expect(e.details).toEqual({
          d:
            '[CranService.getPackageList] Error encountered in parsing response',
          r: { errorType: 'Error', errorMsg: 'Some Error' },
        });
      }
    });
  });

  describe('{ downloadPackage }', () => {
    let service;
    let p;
    let pipeMock;

    beforeEach(() => {
      service = new Cran({ pDir: '.tmp/pkg' });
      pipeMock = jest.fn();
      axios.get.mockReturnValue({
        status: 200,
        data: {
          pipe: pipeMock,
        },
      });

      fs.existsSync.mockReturnValue(true);
      p = {
        package: 'abc',
        version: '1.2.3',
        download_link:
          'https://cran.r-project.org/src/contrib/abc_1.2.3.tar.gz',
      };

      fs.createWriteStream.mockImplementationOnce(() => {
        const self = new events.EventEmitter();
        setTimeout(() => {
          self.emit('finish');
        }, 100);
        return self;
      });
    });

    test('{ should check if local package dir exists }', async () => {
      await service.downloadPackage(p);
      expect(fs.existsSync).toHaveBeenCalledTimes(1);
      expect(fs.existsSync).toHaveBeenCalledWith('.tmp/pkg');
    });

    test('{ should create local package directory if not exists }', async () => {
      fs.existsSync.mockReturnValue(false);

      await service.downloadPackage(p);
      expect(fs.mkdirSync).toHaveBeenCalledTimes(1);
      expect(fs.mkdirSync).toHaveBeenCalledWith('.tmp/pkg');
    });

    test('{ should call `axios.get` once with package download lonk & responseType = stream }', async () => {
      await service.downloadPackage(p);
      expect(axios.get).toHaveBeenCalledTimes(1);
      expect(
        axios.get,
      ).toHaveBeenCalledWith(
        'https://cran.r-project.org/src/contrib/abc_1.2.3.tar.gz',
        { responseType: 'stream' },
      );
    });

    test('{ should call response.data.pipe }', async () => {
      await service.downloadPackage(p);
      expect(pipeMock).toHaveBeenCalledTimes(1);
    });

    test('{ should throw CranError when response status is not 200 }', async () => {
      axios.get.mockReturnValue({ status: 400 });

      try {
        await service.downloadPackage(p);
      } catch (e) {
        expect(e.message).toEqual('CranError');
        expect(e.details).toEqual({
          d: '[CranService.downloadPackage] Cran Server returned HTTP 400',
          r: { status: 400 },
        });
      }
    });

    test('{ should throw CranError when response.data is null or undefined }', async () => {
      axios.get.mockReturnValue({ status: 200 });

      try {
        await service.downloadPackage(p);
      } catch (e) {
        expect(e.message).toEqual('CranError');
        expect(e.details).toEqual({
          d: '[CranService.downloadPackage] No response data returned',
          r: { status: 200 },
        });
      }
    });

    test('{ should throw CranError when unexpected error is thrown }', async () => {
      axios.get.mockRejectedValue(new Error('Some Error'));

      try {
        await service.downloadPackage(p);
      } catch (e) {
        expect(e.message).toEqual('CranError');
        expect(e.details).toEqual({
          d: '[CranService.downloadPackage] Download package failed',
          r: { errorType: 'Error', errorMsg: 'Some Error' },
        });
      }
    });

    test('{ should log error }', async () => {
      axios.get.mockRejectedValue(new Error('Some Error'));

      try {
        await service.downloadPackage();
      } catch (e) {
        expect(consoleErrorSpy).toHaveBeenCalledTimes(1);
      }
    });
  });

  describe('{ parseDescriptionFile, lookAhead }', () => {
    let sampleText;

    test('{ should parse correctly and return package, version & search_name }', async () => {
      sampleText =
        'Package: A3\n' +
        'Version: 1.0.0\n' +
        'Depends: R (>= 2.15.0), xtable, pbapply\n\n' +
        'Title: A Title\n' +
        'Description: A Description\n' +
        'Date: 2018-10-12\n' +
        'Author: Harry Potter, Ron Weasley, Hermione Granger\n' +
        'Yadayada: Some irrelevant line\n' +
        'Maintainer: Harry Potter <hp@gmail.com>\n';

      const list = Cran.parseDescriptionFile(sampleText);
      expect(list).toEqual({
        authors: [
          { name: 'Harry Potter' },
          { name: 'Ron Weasley' },
          { name: 'Hermione Granger' },
        ],
        description: 'A Description',
        title: 'A Title',
        maintainer: {
          email: 'hp@gmail.com',
          name: 'Harry Potter',
        },
      });
    });

    test('{ should handle multiple lines }', async () => {
      sampleText =
        'Package: A3\n' +
        'Version: 1.0.0\n' +
        'Depends: R (>= 2.15.0), xtable, pbapply\n\n' +
        'Title: A Title That Is So Long It Takes Up More Than\n' +
        '   A Line Which Is Odd Because A Title Should Be Short\n' +
        'Description: One Thing I dont know why it doesnt even matter\n' +
        '   how hard I try. Keep that in mind I designed this rhyme\n' +
        '   to explain in due time\n' +
        'Date: 2018-10-12\n' +
        'Author: Harry Potter, Ron Weasley, Hermione Granger\n' +
        'Yadayada: Some irrelevant line\n' +
        'Maintainer: Harry Potter <hp@gmail.com>\n';

      const list = Cran.parseDescriptionFile(sampleText);
      expect(list).toEqual({
        authors: [
          { name: 'Harry Potter' },
          { name: 'Ron Weasley' },
          { name: 'Hermione Granger' },
        ],
        description:
          'One Thing I dont know why it doesnt even matter how hard I try.' +
          ' Keep that in mind I designed this rhyme to explain in due time',
        title:
          'A Title That Is So Long It Takes Up More Than A Line Which Is Odd' +
          ' Because A Title Should Be Short',
        maintainer: {
          email: 'hp@gmail.com',
          name: 'Harry Potter',
        },
      });
    });
  });

  describe('{ _sanitizeAuthors }', () => {
    test('{ should remove all inside [ ] }', async () => {
      const author = Cran._sanitizeAuthors(
        'Harry Potter [cut], Ron Weasley [aud]',
      );
      expect(new Set(author)).toEqual(
        new Set([{ name: 'Harry Potter' }, { name: 'Ron Weasley' }]),
      );
    });

    test('{ should remove all inside < > }', async () => {
      const author = Cran._sanitizeAuthors(
        'Harry Potter [cut], Ron Weasley [aud] <hhttpp://unpredictabletext>',
      );
      expect(new Set(author)).toEqual(
        new Set([{ name: 'Harry Potter' }, { name: 'Ron Weasley' }]),
      );
    });

    test('{ should replace and with , }', async () => {
      const author = Cran._sanitizeAuthors('Harry Potter and Ron Weasley');
      expect(new Set(author)).toEqual(
        new Set([{ name: 'Harry Potter' }, { name: 'Ron Weasley' }]),
      );
    });

    test('{ should replace & with , }', async () => {
      const author = Cran._sanitizeAuthors('Harry Potter & Ron Weasley');
      expect(new Set(author)).toEqual(
        new Set([{ name: 'Harry Potter' }, { name: 'Ron Weasley' }]),
      );
    });
  });

  describe('{ _getNameAndEmail }', () => {
    test('{ should return name and email }', async () => {
      const author = Cran._getNameAndEmail('Harry Potter <harry@gmail.com>');
      expect(author).toEqual({
        name: 'Harry Potter',
        email: 'harry@gmail.com',
      });
    });
  });
});
