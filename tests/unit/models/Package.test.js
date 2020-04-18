'use strict';

const Package = require('../../../models/Package');

describe('[ Models - Package ]', () => {
  let model;
  let mockKnex;
  let dbMock;

  describe('{ constructor }', () => {
    mockKnex = jest.fn();
    model = new Package(mockKnex);
    test('{ should assign db instance }', () => {
      expect(model._db).not.toBe(null);
    });
  });

  describe('{ createPackages }', () => {
    let sample;

    beforeEach(() => {
      sample = [{ package: 'Foo' }, { package: 'Bar' }];
      dbMock = {
        batchInsert: jest.fn().mockReturnValue([1]),
      };
      mockKnex = dbMock;
      model = new Package(mockKnex);
    });

    test('{ should have called batch insert to packages table }', async () => {
      await model.createPackages(sample);
      expect(dbMock.batchInsert).toHaveBeenCalledTimes(1);
      expect(dbMock.batchInsert).toHaveBeenCalledWith('packages', sample, 1000);
    });

    test('{ should have returned null }', async () => {
      const r = await model.createPackages(sample);
      expect(r).toBeNull();
    });

    test('{ should throw error if db batch insert encounters error }', async () => {
      dbMock.batchInsert.mockRejectedValue('e');

      try {
        await model.createPackages(sample);
      } catch (e) {
        expect(e).not.toBeNull();
        expect(e.message).toEqual('DatabaseError');
      }
    });
  });

  describe('{ getAllPackages }', () => {
    let tableMock;
    let limitMock;

    beforeEach(() => {
      limitMock = jest.fn().mockReturnValue([{ id: 1 }, { id: 2 }]);
      tableMock = jest.fn().mockReturnValue([{ id: 1 }, { id: 2 }]);
      dbMock = {
        select: jest.fn().mockImplementation(() => ({
          table: tableMock,
        })),
      };
      model = new Package(dbMock);
    });

    test('{ should have called select from packages table }', async () => {
      await model.getAllPackages();
      expect(dbMock.select).toHaveBeenCalledTimes(1);
      expect(tableMock).toHaveBeenCalledWith('packages');
    });

    test('{ should have called select from packages table with limit }', async () => {
      tableMock = jest.fn().mockImplementation(() => ({
        limit: limitMock,
      }));

      await model.getAllPackages(5);
      expect(dbMock.select).toHaveBeenCalledTimes(1);
      expect(tableMock).toHaveBeenCalledWith('packages');
      expect(limitMock).toHaveBeenCalledWith(5);
    });

    test('{ should have returned the retrieved rows }', async () => {
      const r = await model.getAllPackages();
      expect(r).toEqual([{ id: 1 }, { id: 2 }]);
    });

    test('{ should throw error if db select encounters error }', async () => {
      tableMock.mockRejectedValue('e');

      try {
        await model.getAllPackages();
      } catch (e) {
        expect(e).not.toBeNull();
        expect(e.message).toEqual('DatabaseError');
      }
    });
  });

  describe('{ getAllPackagesJoinedInfo }', () => {
    let fromMock;
    let rightJoinMock;

    beforeEach(() => {
      rightJoinMock = jest.fn().mockReturnValue([]);
      fromMock = jest.fn().mockImplementation(() => ({
        rightJoin: rightJoinMock,
      }));
      dbMock = {
        select: jest.fn().mockImplementation(() => ({
          from: fromMock,
        })),
      };
      model = new Package(dbMock);
    });

    test('{ should select specific columns }', async () => {
      await model.getAllPackagesJoinedInfo();
      expect(dbMock.select).toHaveBeenCalledTimes(1);
      expect(dbMock.select).toHaveBeenCalledWith([
        'packages.id',
        'packages.package',
        'packages.version',
        'package_info.title',
        'package_info.description',
        'package_info.publication',
        'packages.package_info_id',
      ]);
    });

    test('{ should select from packages table }', async () => {
      await model.getAllPackagesJoinedInfo();
      expect(fromMock).toHaveBeenCalledTimes(1);
      expect(fromMock).toHaveBeenCalledWith('packages');
    });

    test('{ should right join with package_info }', async () => {
      await model.getAllPackagesJoinedInfo();
      expect(rightJoinMock).toHaveBeenCalledTimes(1);
      expect(rightJoinMock).toHaveBeenCalledWith(
        'package_info',
        'packages.package_info_id',
        'package_info.id',
      );
    });

    test('{ should have returned the retrieved rows }', async () => {
      const r = await model.getAllPackagesJoinedInfo();
      expect(r).toEqual([]);
    });

    test('{ should throw error if db select encounters error }', async () => {
      rightJoinMock.mockRejectedValue('e');

      try {
        await model.getAllPackagesJoinedInfo();
      } catch (e) {
        expect(e).not.toBeNull();
        expect(e.message).toEqual('DatabaseError');
      }
    });
  });

  describe('{ searchPackageByName }', () => {
    let fromMock;
    let rightJoinMock;
    let whereMock;

    beforeEach(() => {
      whereMock = jest.fn().mockReturnValue([]);
      rightJoinMock = jest.fn().mockImplementation(() => ({
        where: whereMock,
      }));
      fromMock = jest.fn().mockImplementation(() => ({
        rightJoin: rightJoinMock,
      }));
      dbMock = {
        select: jest.fn().mockImplementation(() => ({
          from: fromMock,
        })),
      };
      model = new Package(dbMock);
    });

    test('{ should select specific columns }', async () => {
      await model.searchPackageByName('foo');
      expect(dbMock.select).toHaveBeenCalledTimes(1);
      expect(dbMock.select).toHaveBeenCalledWith([
        'packages.id',
        'packages.package',
        'packages.version',
        'package_info.title',
        'package_info.description',
        'package_info.publication',
        'packages.package_info_id',
      ]);
    });

    test('{ should select from packages table }', async () => {
      await model.searchPackageByName('foo');
      expect(fromMock).toHaveBeenCalledTimes(1);
      expect(fromMock).toHaveBeenCalledWith('packages');
    });

    test('{ should right join with package_info }', async () => {
      await model.searchPackageByName('foo');
      expect(rightJoinMock).toHaveBeenCalledTimes(1);
      expect(rightJoinMock).toHaveBeenCalledWith(
        'package_info',
        'packages.package_info_id',
        'package_info.id',
      );
    });

    test('{ should right join with package_info }', async () => {
      await model.searchPackageByName('foo');
      expect(whereMock).toHaveBeenCalledTimes(1);
      expect(whereMock).toHaveBeenCalledWith(
        'packages.search_name',
        'like',
        '%foo%',
      );
    });

    test('{ should have returned the retrieved rows }', async () => {
      const r = await model.searchPackageByName('foo');
      expect(r).toEqual([]);
    });

    test('{ should throw error if db select encounters error }', async () => {
      whereMock.mockRejectedValue('e');

      try {
        await model.searchPackageByName('foo');
      } catch (e) {
        expect(e).not.toBeNull();
        expect(e.message).toEqual('DatabaseError');
      }
    });
  });
});
