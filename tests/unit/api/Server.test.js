'use strict';

// eslint-disable-next-line no-unused-vars
let express = require('express');
const Server = require('../../../api/Server');

const Author = require('../../../models/Author');
const Package = require('../../../models/Package');
const PackageAuthor = require('../../../models/PackageAuthor');
const PackageInfo = require('../../../models/PackageInfo');

jest.mock('../../../models/Author');
jest.mock('../../../models/Package');
jest.mock('../../../models/PackageAuthor');
jest.mock('../../../models/PackageInfo');
jest.mock('express');

describe('[ API - Server ]', () => {
  let server;
  let reqMock;
  let resMock;
  let nextMock;
  let resStatusMock;
  let jsonReturnMock;

  beforeEach(() => {
    express.mockImplementation(() => ({
      use: jest.fn(),
      get: jest.fn(),
      listen: jest.fn(),
    }));

    server = new Server({
      config: {
        host: 'localhost',
        port: '3001',
      },
      models: {
        author: new Author(),
        package: new Package(),
        packageAuthor: new PackageAuthor(),
        packageInfo: new PackageInfo(),
      },
    });

    reqMock = { query: { q: 'abc' } };
    jsonReturnMock = jest.fn();
    resStatusMock = jest
      .fn()
      .mockImplementation(() => ({ json: jsonReturnMock }));
    resMock = { status: resStatusMock };
    nextMock = jest.fn();
  });

  describe('{ constructor }', () => {
    test('{ should have host, port, models and express instance }', () => {
      expect(server._host).toEqual('localhost');
      expect(server._port).toEqual('3001');
      expect(server._models).not.toBeNull();
      expect(server._app).not.toBeNull();
    });
  });

  describe('{ init }', () => {
    test('{ should add middlewares }', async () => {
      await server.init();

      expect(server._app.use).toHaveBeenCalledTimes(2);
      expect(server._app.use).toHaveBeenNthCalledWith(1, expect.any(Function));
      expect(server._app.use).toHaveBeenNthCalledWith(2, expect.any(Function));
    });

    test('{ should add route handlers }', async () => {
      await server.init();

      expect(server._app.get).toHaveBeenCalledTimes(4);
      expect(server._app.get).toHaveBeenNthCalledWith(
        1,
        '/api/search',
        Server._validateParams,
        expect.any(Function),
      );

      expect(server._app.get).toHaveBeenNthCalledWith(
        2,
        '/api/packages',
        expect.any(Function),
      );

      expect(server._app.get).toHaveBeenNthCalledWith(
        3,
        '/api/authors',
        expect.any(Function),
      );

      expect(server._app.get).toHaveBeenNthCalledWith(
        4,
        '*',
        expect.any(Function),
      );
    });
  });

  describe('{ start }', () => {
    test('{ should call start listening to provided port }', async () => {
      await server.start();
      expect(server._app.listen).toHaveBeenCalledTimes(1);
      expect(server._app.listen).toHaveBeenCalledWith(
        '3001',
        '0.0.0.0',
        expect.any(Function),
      );
    });
  });

  describe('{ _validateParams }', () => {
    test('{ should return 400 when req.query.q is empty }', async () => {
      reqMock = { query: { q: '' } };
      await Server._validateParams(reqMock, resMock, nextMock);

      expect(nextMock).not.toHaveBeenCalled();
      expect(resStatusMock).toHaveBeenCalledTimes(1);
      expect(resStatusMock).toHaveBeenCalledWith(400);
      expect(jsonReturnMock).toHaveBeenCalledWith({
        error: 'Invalid search parameters',
      });
    });

    test('{ should return 400 when req.query.q does not exist }', async () => {
      reqMock = { query: { w: '' } };
      await Server._validateParams(reqMock, resMock, nextMock);

      expect(nextMock).not.toHaveBeenCalled();
      expect(resStatusMock).toHaveBeenCalledTimes(1);
      expect(resStatusMock).toHaveBeenCalledWith(400);
      expect(jsonReturnMock).toHaveBeenCalledWith({
        error: 'Invalid search parameters',
      });
    });

    test('{ should return 400 when req.query.q is not a string }', async () => {
      reqMock = { query: { q: ['invalid'] } };
      await Server._validateParams(reqMock, resMock, nextMock);

      expect(nextMock).not.toHaveBeenCalled();
      expect(resStatusMock).toHaveBeenCalledTimes(1);
      expect(resStatusMock).toHaveBeenCalledWith(400);
      expect(jsonReturnMock).toHaveBeenCalledWith({
        error: 'Invalid search parameters',
      });
    });

    test('{ should call next callback when q is valid }', async () => {
      await Server._validateParams(reqMock, resMock, nextMock);

      expect(nextMock).toHaveBeenCalledTimes(1);
      expect(resStatusMock).not.toHaveBeenCalled();
      expect(jsonReturnMock).not.toHaveBeenCalled();
    });
  });

  describe('{ _searchPackages }', () => {
    let queryForPackageInfoMock;
    let queryForPackageAuthorsMappingMock;
    let samplePackages;
    let samplePackageAuthorMaps;

    beforeEach(() => {
      queryForPackageInfoMock = Package.mock.instances[0].searchPackageByName;
      queryForPackageAuthorsMappingMock =
        PackageAuthor.mock.instances[0].getAllPackageAuthorsByIds;

      samplePackages = [
        {
          id: 1,
          package: 'abc',
          version: '1.2.3',
          package_info_id: 1,
          title: 'Title',
          description: 'Desc',
          publication: '2020-01-01',
        },
        {
          id: 2,
          package: 'def',
          version: '1.2.3',
          package_info_id: 2,
          title: 'Title 1',
          description: 'Desc 1',
          publication: '2020-01-01',
        },
      ];

      samplePackageAuthorMaps = [
        {
          id: 1,
          type: 'author',
          name: 'Mr A',
          email: 'mra@gmail.com',
          package_info_id: 1,
        },
        {
          id: 2,
          type: 'maintainer',
          name: 'Mr A',
          email: 'mra@gmail.com',
          package_info_id: 1,
        },
        {
          id: 3,
          type: 'author',
          name: 'Mr B',
          email: '',
          package_info_id: 1,
        },
        {
          id: 4,
          type: 'author',
          name: 'Mr C',
          email: '',
          package_info_id: 1,
        },
        {
          id: 5,
          type: 'author',
          name: 'Mr A',
          email: 'mra@gmail.com',
          package_info_id: 2,
        },
        {
          id: 6,
          type: 'maintainer',
          name: 'Mr A',
          email: 'mra@gmail.com',
          package_info_id: 2,
        },
      ];
    });

    describe('when no results found', () => {
      test('{ should call query and return 200 and packages = [] }', async () => {
        reqMock = { query: { q: 'abc' } };
        queryForPackageInfoMock.mockReturnValue([]);

        await server._searchPackages(reqMock, resMock);

        expect(queryForPackageInfoMock).toHaveBeenCalledTimes(1);
        expect(queryForPackageInfoMock).toHaveBeenCalledWith('abc');
        expect(resStatusMock).toHaveBeenCalledTimes(1);
        expect(resStatusMock).toHaveBeenCalledWith(200);
        expect(jsonReturnMock).toHaveBeenCalledWith({
          packages: [],
        });
      });
    });

    describe('when there are results found', () => {
      test('{ should call query and return 200 & packages = formatted results }', async () => {
        reqMock = { query: { q: 'abc' } };
        queryForPackageInfoMock.mockReturnValue(samplePackages);
        queryForPackageAuthorsMappingMock.mockReturnValue(
          samplePackageAuthorMaps,
        );

        await server._searchPackages(reqMock, resMock);

        expect(queryForPackageInfoMock).toHaveBeenCalledTimes(1);
        expect(queryForPackageInfoMock).toHaveBeenCalledWith('abc');

        expect(queryForPackageAuthorsMappingMock).toHaveBeenCalledTimes(1);
        expect(queryForPackageAuthorsMappingMock).toHaveBeenCalledWith([1, 2]);

        expect(resStatusMock).toHaveBeenCalledTimes(1);
        expect(resStatusMock).toHaveBeenCalledWith(200);
        expect(jsonReturnMock).toHaveBeenCalledWith({
          packages: [
            {
              id: 1,
              name: 'abc',
              version: '1.2.3',
              title: 'Title',
              description: 'Desc',
              publication: '2020-01-01',
              authors: [
                { name: 'Mr A', email: 'mra@gmail.com' },
                { name: 'Mr B', email: '' },
                { name: 'Mr C', email: '' },
              ],
              maintainers: [{ name: 'Mr A', email: 'mra@gmail.com' }],
            },
            {
              id: 2,
              name: 'def',
              version: '1.2.3',
              title: 'Title 1',
              description: 'Desc 1',
              publication: '2020-01-01',
              authors: [{ name: 'Mr A', email: 'mra@gmail.com' }],
              maintainers: [{ name: 'Mr A', email: 'mra@gmail.com' }],
            },
          ],
        });
      });
    });

    test('{ should return 500 when search query fails }', async () => {
      reqMock = { query: { q: 'abc' } };
      queryForPackageInfoMock.mockRejectedValue(new Error('Some Error'));

      await server._searchPackages(reqMock, resMock);

      expect(resStatusMock).toHaveBeenCalledTimes(1);
      expect(resStatusMock).toHaveBeenCalledWith(500);
      expect(jsonReturnMock).toHaveBeenCalledWith({
        error: 'Internal Server Error',
      });
    });

    test('{ should return 500 when 2nd query fails }', async () => {
      reqMock = { query: { q: 'abc' } };
      queryForPackageInfoMock.mockReturnValue(samplePackages);

      queryForPackageAuthorsMappingMock.mockRejectedValue(
        new Error('Some Error'),
      );

      await server._searchPackages(reqMock, resMock);

      expect(resStatusMock).toHaveBeenCalledTimes(1);
      expect(resStatusMock).toHaveBeenCalledWith(500);
      expect(jsonReturnMock).toHaveBeenCalledWith({
        error: 'Internal Server Error',
      });
    });
  });

  describe('{ _getPackages }', () => {
    let queryForPackageInfoMock;
    let queryForPackageAuthorsMappingMock;
    let samplePackages;
    let samplePackageAuthorMaps;

    beforeEach(() => {
      queryForPackageInfoMock =
        Package.mock.instances[0].getAllPackagesJoinedInfo;
      queryForPackageAuthorsMappingMock =
        PackageAuthor.mock.instances[0].getAllPackageAuthorsByIds;

      samplePackages = [
        {
          id: 1,
          package: 'abc',
          version: '1.2.3',
          package_info_id: 1,
          title: 'Title',
          description: 'Desc',
          publication: '2020-01-01',
        },
        {
          id: 2,
          package: 'def',
          version: '1.2.3',
          package_info_id: 2,
          title: 'Title 1',
          description: 'Desc 1',
          publication: '2020-01-01',
        },
      ];

      samplePackageAuthorMaps = [
        {
          id: 1,
          type: 'author',
          name: 'Mr A',
          email: 'mra@gmail.com',
          package_info_id: 1,
        },
        {
          id: 2,
          type: 'maintainer',
          name: 'Mr A',
          email: 'mra@gmail.com',
          package_info_id: 1,
        },
        {
          id: 3,
          type: 'author',
          name: 'Mr B',
          email: '',
          package_info_id: 1,
        },
        {
          id: 4,
          type: 'author',
          name: 'Mr C',
          email: '',
          package_info_id: 1,
        },
        {
          id: 5,
          type: 'author',
          name: 'Mr A',
          email: 'mra@gmail.com',
          package_info_id: 2,
        },
        {
          id: 6,
          type: 'maintainer',
          name: 'Mr A',
          email: 'mra@gmail.com',
          package_info_id: 2,
        },
      ];
    });

    describe('when no results found', () => {
      test('{ should call query and return 200 and packages = [] }', async () => {
        queryForPackageInfoMock.mockReturnValue([]);

        await server._getPackages(reqMock, resMock);

        expect(queryForPackageInfoMock).toHaveBeenCalledTimes(1);
        expect(queryForPackageInfoMock).toHaveBeenCalledWith();
        expect(resStatusMock).toHaveBeenCalledTimes(1);
        expect(resStatusMock).toHaveBeenCalledWith(200);
        expect(jsonReturnMock).toHaveBeenCalledWith({
          packages: [],
        });
      });
    });

    describe('when there are results found', () => {
      test('{ should call query and return 200 & packages = formatted results }', async () => {
        queryForPackageInfoMock.mockReturnValue(samplePackages);
        queryForPackageAuthorsMappingMock.mockReturnValue(
          samplePackageAuthorMaps,
        );

        await server._getPackages(reqMock, resMock);

        expect(queryForPackageInfoMock).toHaveBeenCalledTimes(1);
        expect(queryForPackageInfoMock).toHaveBeenCalledWith();

        expect(queryForPackageAuthorsMappingMock).toHaveBeenCalledTimes(1);
        expect(queryForPackageAuthorsMappingMock).toHaveBeenCalledWith([1, 2]);

        expect(resStatusMock).toHaveBeenCalledTimes(1);
        expect(resStatusMock).toHaveBeenCalledWith(200);
        expect(jsonReturnMock).toHaveBeenCalledWith({
          packages: [
            {
              id: 1,
              name: 'abc',
              version: '1.2.3',
              title: 'Title',
              description: 'Desc',
              publication: '2020-01-01',
              authors: [
                { name: 'Mr A', email: 'mra@gmail.com' },
                { name: 'Mr B', email: '' },
                { name: 'Mr C', email: '' },
              ],
              maintainers: [{ name: 'Mr A', email: 'mra@gmail.com' }],
            },
            {
              id: 2,
              name: 'def',
              version: '1.2.3',
              title: 'Title 1',
              description: 'Desc 1',
              publication: '2020-01-01',
              authors: [{ name: 'Mr A', email: 'mra@gmail.com' }],
              maintainers: [{ name: 'Mr A', email: 'mra@gmail.com' }],
            },
          ],
        });
      });
    });

    test('{ should return 500 when search query fails }', async () => {
      queryForPackageInfoMock.mockRejectedValue(new Error('Some Error'));

      await server._getPackages(reqMock, resMock);

      expect(resStatusMock).toHaveBeenCalledTimes(1);
      expect(resStatusMock).toHaveBeenCalledWith(500);
      expect(jsonReturnMock).toHaveBeenCalledWith({
        error: 'Internal Server Error',
      });
    });

    test('{ should return 500 when 2nd query fails }', async () => {
      queryForPackageInfoMock.mockReturnValue(samplePackages);

      queryForPackageAuthorsMappingMock.mockRejectedValue(
        new Error('Some Error'),
      );

      await server._getPackages(reqMock, resMock);

      expect(resStatusMock).toHaveBeenCalledTimes(1);
      expect(resStatusMock).toHaveBeenCalledWith(500);
      expect(jsonReturnMock).toHaveBeenCalledWith({
        error: 'Internal Server Error',
      });
    });
  });

  describe('{ _getAuthors }', () => {
    let queryForAuthorsMock;
    let sampleAuthors;

    beforeEach(() => {
      queryForAuthorsMock = Author.mock.instances[0].getAllAuthors;
      sampleAuthors = [
        {
          id: 1,
          name: 'Mr A',
          email: 'mra@gmail.com',
        },
        {
          id: 2,
          name: 'Mr B',
          email: '',
        },
        {
          id: 3,
          name: 'Mr C',
          email: '',
        },
      ];
    });

    describe('when no results found', () => {
      test('{ should call query and return 200 and authors = [] }', async () => {
        reqMock = { query: { q: 'abc' } };
        queryForAuthorsMock.mockReturnValue([]);

        await server._getAuthors(reqMock, resMock);

        expect(queryForAuthorsMock).toHaveBeenCalledTimes(1);
        expect(queryForAuthorsMock).toHaveBeenCalledWith();
        expect(resStatusMock).toHaveBeenCalledTimes(1);
        expect(resStatusMock).toHaveBeenCalledWith(200);
        expect(jsonReturnMock).toHaveBeenCalledWith({
          authors: [],
        });
      });
    });

    describe('when there are results found', () => {
      test('{ should call query and return 200 & authors = results }', async () => {
        queryForAuthorsMock.mockReturnValue(sampleAuthors);
        await server._getAuthors(reqMock, resMock);

        expect(queryForAuthorsMock).toHaveBeenCalledTimes(1);
        expect(queryForAuthorsMock).toHaveBeenCalledWith();
        expect(resStatusMock).toHaveBeenCalledTimes(1);
        expect(resStatusMock).toHaveBeenCalledWith(200);
        expect(jsonReturnMock).toHaveBeenCalledWith({
          authors: sampleAuthors,
        });
      });
    });

    test('{ should return 500 when get authors query fails }', async () => {
      queryForAuthorsMock.mockRejectedValue(new Error('Some Error'));
      await server._getAuthors(reqMock, resMock);

      expect(resStatusMock).toHaveBeenCalledTimes(1);
      expect(resStatusMock).toHaveBeenCalledWith(500);
      expect(jsonReturnMock).toHaveBeenCalledWith({
        error: 'Internal Server Error',
      });
    });
  });

  describe('{ _getAuthorsAndFormatResults }', () => {
    let queryForPackageAuthorsMappingMock;
    let samplePackages;
    let samplePackageAuthorMaps;

    beforeEach(() => {
      queryForPackageAuthorsMappingMock =
        PackageAuthor.mock.instances[0].getAllPackageAuthorsByIds;

      samplePackages = [
        {
          id: 1,
          package: 'abc',
          version: '1.2.3',
          package_info_id: 1,
          title: 'Title',
          description: 'Desc',
          publication: '2020-01-01',
        },
        {
          id: 2,
          package: 'def',
          version: '1.2.3',
          package_info_id: 2,
          title: 'Title 1',
          description: 'Desc 1',
          publication: '2020-01-01',
        },
      ];

      samplePackageAuthorMaps = [
        {
          id: 1,
          type: 'author',
          name: 'Mr A',
          email: 'mra@gmail.com',
          package_info_id: 1,
        },
        {
          id: 2,
          type: 'maintainer',
          name: 'Mr A',
          email: 'mra@gmail.com',
          package_info_id: 1,
        },
        {
          id: 3,
          type: 'author',
          name: 'Mr B',
          email: '',
          package_info_id: 1,
        },
        {
          id: 4,
          type: 'author',
          name: 'Mr C',
          email: '',
          package_info_id: 1,
        },
        {
          id: 5,
          type: 'author',
          name: 'Mr A',
          email: 'mra@gmail.com',
          package_info_id: 2,
        },
        {
          id: 6,
          type: 'maintainer',
          name: 'Mr A',
          email: 'mra@gmail.com',
          package_info_id: 2,
        },
      ];
    });

    test('{ should call query for mappings  }', async () => {
      queryForPackageAuthorsMappingMock.mockReturnValue(
        samplePackageAuthorMaps,
      );

      await server._getAuthorsAndFormatResults(samplePackages);
      expect(queryForPackageAuthorsMappingMock).toHaveBeenCalledTimes(1);
      expect(queryForPackageAuthorsMappingMock).toHaveBeenCalledWith([1, 2]);
    });

    test('{ should return formatted result  }', async () => {
      queryForPackageAuthorsMappingMock.mockReturnValue(
        samplePackageAuthorMaps,
      );

      const response = await server._getAuthorsAndFormatResults(samplePackages);
      expect(new Set(response)).toEqual(
        new Set([
          {
            id: 1,
            name: 'abc',
            version: '1.2.3',
            title: 'Title',
            description: 'Desc',
            publication: '2020-01-01',
            authors: [
              { name: 'Mr A', email: 'mra@gmail.com' },
              { name: 'Mr B', email: '' },
              { name: 'Mr C', email: '' },
            ],
            maintainers: [{ name: 'Mr A', email: 'mra@gmail.com' }],
          },
          {
            id: 2,
            name: 'def',
            version: '1.2.3',
            title: 'Title 1',
            description: 'Desc 1',
            publication: '2020-01-01',
            authors: [{ name: 'Mr A', email: 'mra@gmail.com' }],
            maintainers: [{ name: 'Mr A', email: 'mra@gmail.com' }],
          },
        ]),
      );
    });

    test('{ should throw error when search query fails }', async () => {
      queryForPackageAuthorsMappingMock.mockRejectedValue(
        new Error('Some Error'),
      );

      try {
        await server._getAuthorsAndFormatResults(samplePackages);
      } catch (e) {
        expect(e).not.toBeNull();
      }
    });
  });
});
