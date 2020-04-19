'use strict';

const Cran = require('../../../services/Cran');
const Package = require('../../../models/Package');
const loader = require('../../../fetcher/1_loader');

jest.mock('../../../services/Cran');
jest.mock('../../../models/Package');

describe('[ Fetcher - 1_loader ]', () => {
  let samplePList;

  beforeEach(() => {
    samplePList = [1, 2, 3, 4, 5, 6, 7, 8];

    jest.spyOn(process, 'exit').mockImplementation(() => null);
    Cran.prototype.getPackageList.mockImplementation(() => samplePList);
    Package.prototype.createPackages.mockImplementation(() => []);
  });

  test('should have initialized CranService', async () => {
    await loader();
    expect(Cran).toHaveBeenCalledTimes(1);
    expect(Cran.mock.calls[0][0]).toHaveProperty('maxItems');
  });

  test('should have initialized PackageModel', async () => {
    await loader();
    expect(Package).toHaveBeenCalledTimes(1);
    expect(Package.mock.calls[0]).not.toBeNull();
  });

  test('should call functions for retrieving pkgs & saving to db', async () => {
    await loader();
    expect(Cran.mock.instances[0].getPackageList).toHaveBeenCalledTimes(1);
    expect(Package.mock.instances[0].createPackages).toHaveBeenCalledTimes(1);
  });

  test('should not proceed saving to db if no retrieved packages', async () => {
    Cran.prototype.getPackageList.mockImplementation(() => []);

    await loader();
    expect(Package.mock.instances[0].createPackages).not.toHaveBeenCalled();
  });
});
