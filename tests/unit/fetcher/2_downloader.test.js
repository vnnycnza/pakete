'use strict';

const Cran = require('../../../services/Cran');
const Package = require('../../../models/Package');
const downloader = require('../../../fetcher/2_downloader');

jest.mock('../../../services/Cran');
jest.mock('../../../models/Package');

describe('[ Fetcher - 2_downloader ]', () => {
  let samplePList;

  beforeEach(() => {
    samplePList = [1, 2, 3, 4, 5, 6, 7];

    jest.spyOn(process, 'exit').mockImplementation(() => null);
    Package.prototype.getAllPackages.mockImplementation(() => samplePList);
    Cran.prototype.downloadPackage.mockImplementation(() => []);
  });

  test('should have initialized CranService', async () => {
    await downloader();
    expect(Cran).toHaveBeenCalledTimes(1);
    expect(Cran.mock.calls[0][0]).toHaveProperty('pDir');
  });

  test('should have initialized PackageModel', async () => {
    await downloader();
    expect(Package).toHaveBeenCalledTimes(1);
    expect(Package.mock.calls[0]).not.toBeNull();
  });

  test('should call function for retrieving pkgs', async () => {
    await downloader();
    expect(Package.mock.instances[0].getAllPackages).toHaveBeenCalledTimes(1);
  });

  test('should call function for downloading pkgs', async () => {
    await downloader();
    expect(Cran.mock.instances[0].downloadPackage).toHaveBeenCalledTimes(
      samplePList.length,
    );
  });

  test('should not proceed downloading if no retrieved packages', async () => {
    Package.prototype.getAllPackages.mockImplementation(() => []);

    await downloader();
    expect(Cran.mock.instances[0].downloadPackage).not.toHaveBeenCalled();
  });
});
