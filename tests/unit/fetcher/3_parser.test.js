'use strict';

const fs = require('fs');
const Author = require('../../../models/Author');
const Package = require('../../../models/Package');
const PackageAuthor = require('../../../models/PackageAuthor');
const PackageInfo = require('../../../models/PackageInfo');

const parser = require('../../../fetcher/3_parser');

const Cran = require('../../../services/Cran');
const Utils = require('../../../services/Utils');

jest.mock('fs');
jest.mock('../../../models/Author');
jest.mock('../../../models/Package');
jest.mock('../../../models/PackageAuthor');
jest.mock('../../../models/PackageInfo');
jest.mock('../../../services/Cran');
jest.mock('../../../services/Utils');

describe('[ Fetcher - 3_parser ]', () => {
  let samplePList;

  beforeEach(() => {
    samplePList = [
      {
        id: 1,
        package: 'A3',
        version: '1.0.0',
        search_name: 'a3',
        download_link: 'https://cran.r-project.org/src/contrib/A3_1.0.0.tar.gz',
      },
      {
        id: 2,
        package: 'aaSEA',
        version: '1.1.0',
        search_name: 'aasea',
        download_link:
          'https://cran.r-project.org/src/contrib/aaSEA_1.1.0.tar.gz',
      },
      {
        id: 3,
        package: 'abc',
        version: '1.1.0',
        search_name: 'abc',
        download_link:
          'https://cran.r-project.org/src/contrib/abc_1.1.0.tar.gz',
      },
    ];

    jest.spyOn(process, 'exit').mockImplementation(() => null);
    Package.prototype.getAllPackages.mockImplementation(() => samplePList);
    fs.existsSync.mockReturnValue(true);
    Utils.getFileContentsFromTar.mockImplementation(() => 'Sample Content');
    Cran.parseDescriptionFile
      .mockImplementationOnce(() => ({
        id: 1,
        authors: [{ name: 'Mr A' }, { name: 'Ms A' }],
        maintainer: { name: 'Mr A' },
      }))
      .mockImplementationOnce(() => ({
        id: 2,
        authors: [{ name: 'Mr B' }, { name: 'Ms B' }],
        maintainer: { name: 'Mr A' },
      }))
      .mockImplementationOnce(() => ({
        id: 3,
        authors: [{ name: 'Mr A' }, { name: 'Ms C' }],
        maintainer: { name: 'Mr A' },
      }));
    Author.prototype.createAuthors.mockImplementation(() => null);
    Author.prototype.getAllAuthors.mockImplementation(() => [
      { id: 1, name: 'Mr A' },
      { id: 2, name: 'Ms A' },
      { id: 3, name: 'Mr B' },
      { id: 4, name: 'Ms B' },
      { id: 5, name: 'Mr C' },
      { id: 5, name: 'Ms C' },
    ]);

    PackageInfo.prototype.createPackageInfo
      .mockImplementationOnce(() => 1)
      .mockImplementationOnce(() => 2)
      .mockImplementationOnce(() => 3);

    PackageAuthor.prototype.createPackageAuthors.mockImplementation(() => null);
    fs.rmdirSync.mockReturnValue(true);
  });

  test('should have initialized all models', async () => {
    await parser();

    expect(Author).toHaveBeenCalledTimes(1);
    expect(Author.mock.calls[0]).not.toBeNull();
    expect(Package).toHaveBeenCalledTimes(1);
    expect(Package.mock.calls[0]).not.toBeNull();
    expect(PackageAuthor).toHaveBeenCalledTimes(1);
    expect(PackageAuthor.mock.calls[0]).not.toBeNull();
    expect(PackageInfo).toHaveBeenCalledTimes(1);
    expect(PackageInfo.mock.calls[0]).not.toBeNull();
  });

  test('should call function for retrieving pkgs', async () => {
    await parser();
    expect(Package.mock.instances[0].getAllPackages).toHaveBeenCalledTimes(1);
  });

  test('should call function for reading file contents', async () => {
    await parser();
    expect(Utils.getFileContentsFromTar).toHaveBeenCalledTimes(3);
  });

  test('should call function for parsing description file', async () => {
    await parser();
    expect(Cran.parseDescriptionFile).toHaveBeenCalledTimes(3);
  });

  test('should call function to save authors', async () => {
    await parser();
    expect(Author.mock.instances[0].createAuthors).toHaveBeenCalledTimes(1);
    expect(Author.mock.instances[0].getAllAuthors).toHaveBeenCalledTimes(1);
  });

  test('should call function to save package descriptions', async () => {
    await parser();
    expect(
      PackageInfo.mock.instances[0].createPackageInfo,
    ).toHaveBeenCalledTimes(3);
  });

  test('should call function to save author & package mappings', async () => {
    await parser();

    expect(
      PackageAuthor.mock.instances[0].createPackageAuthors,
    ).toHaveBeenCalledTimes(1);
  });

  test('should not proceed further if no packages retrieved', async () => {
    Package.prototype.getAllPackages.mockImplementation(() => []);

    await parser();
    expect(Utils.getFileContentsFromTar).not.toHaveBeenCalled();
    expect(Cran.parseDescriptionFile).not.toHaveBeenCalled();
    expect(Cran.parseDescriptionFile).not.toHaveBeenCalled();
    expect(Author.mock.instances[0].createAuthors).not.toHaveBeenCalled();
    expect(Author.mock.instances[0].getAllAuthors).not.toHaveBeenCalled();
    expect(
      PackageInfo.mock.instances[0].createPackageInfo,
    ).not.toHaveBeenCalled();
    expect(
      PackageAuthor.mock.instances[0].createPackageAuthors,
    ).not.toHaveBeenCalled();
  });

  test('should not proceed further if local directory does not exists', async () => {
    fs.existsSync.mockReturnValue(false);

    await parser();
    expect(Utils.getFileContentsFromTar).not.toHaveBeenCalled();
    expect(Cran.parseDescriptionFile).not.toHaveBeenCalled();
    expect(Cran.parseDescriptionFile).not.toHaveBeenCalled();
    expect(Author.mock.instances[0].createAuthors).not.toHaveBeenCalled();
    expect(Author.mock.instances[0].getAllAuthors).not.toHaveBeenCalled();
    expect(
      PackageInfo.mock.instances[0].createPackageInfo,
    ).not.toHaveBeenCalled();
    expect(
      PackageAuthor.mock.instances[0].createPackageAuthors,
    ).not.toHaveBeenCalled();
  });
});
