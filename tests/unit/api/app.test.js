'use strict';

const Server = require('../../../api/Server');

const Author = require('../../../models/Author');
const Package = require('../../../models/Package');
const PackageAuthor = require('../../../models/PackageAuthor');
const PackageInfo = require('../../../models/PackageInfo');

const app = require('../../../api/app');

jest.mock('../../../models/Author');
jest.mock('../../../models/Package');
jest.mock('../../../models/PackageAuthor');
jest.mock('../../../models/PackageInfo');
jest.mock('../../../api/Server');

describe('[ API - app ]', () => {
  beforeEach(() => {
    jest.spyOn(process, 'exit').mockImplementation(() => null);
  });

  test('should have initialized all models', async () => {
    await app();

    expect(Author).toHaveBeenCalledTimes(1);
    expect(Author.mock.calls[0]).not.toBeNull();
    expect(Package).toHaveBeenCalledTimes(1);
    expect(Package.mock.calls[0]).not.toBeNull();
    expect(PackageAuthor).toHaveBeenCalledTimes(1);
    expect(PackageAuthor.mock.calls[0]).not.toBeNull();
    expect(PackageInfo).toHaveBeenCalledTimes(1);
    expect(PackageInfo.mock.calls[0]).not.toBeNull();
  });

  test('should have created server instance', async () => {
    await app();

    expect(Server).toHaveBeenCalledTimes(1);
    expect(Server.mock.calls[0][0]).toHaveProperty('config');
    expect(Server.mock.calls[0][0]).toHaveProperty('models');
  });

  test('should have initialized server', async () => {
    await app();

    expect(Server.mock.instances[0].init).toHaveBeenCalledTimes(1);
    expect(Server.mock.instances[0].start).toHaveBeenCalledTimes(1);
  });
});
