'use strict';

const PackageInfo = require('../../../models/PackageInfo');
describe('[ Models - PackageInfo ]', () => {
  let model;
  let mockKnex;
  let dbMock;

  describe('{ constructor }', () => {
    mockKnex = jest.fn();
    model = new PackageInfo(mockKnex);

    test('{ should assign db instance }', () => {
      expect(model._db).not.toBe(null);
    });
  });

  describe('{ createPackageInfo }', () => {
    let whereMock;
    let updateMock;

    beforeEach(() => {
      updateMock = jest.fn();
      whereMock = jest
        .fn()
        .mockReturnValueOnce([{ id: 1, title: 'Foo' }])
        .mockReturnValueOnce({ update: updateMock });
      dbMock = {
        insert: jest.fn().mockReturnValue([1]),
        where: whereMock,
      };
      mockKnex = jest.fn().mockImplementation(() => dbMock);
      model = new PackageInfo(mockKnex);
    });

    test('{ should have inserted values to package_info table }', async () => {
      await model.createPackageInfo(1, 'Foo', 'Bar', '2020-10-12');
      expect(mockKnex).toHaveBeenCalledWith('package_info');
      expect(dbMock.insert).toHaveBeenCalledWith({
        title: 'Foo',
        description: 'Bar',
        publication: '2020-10-12',
      });
    });

    test('{ should have retrieved inserted row by returned id }', async () => {
      await model.createPackageInfo(1, 'Foo', 'Bar', '2020-10-12');
      expect(mockKnex).toHaveBeenCalledWith('packages');
      expect(whereMock).toHaveBeenNthCalledWith(1, 'id', 1);
    });

    test('{ should have updated packages.package_info_id to package_info.id }', async () => {
      await model.createPackageInfo(1, 'Foo', 'Bar', '2020-10-12');
      expect(mockKnex).toHaveBeenCalledWith('packages');
      expect(whereMock).toHaveBeenCalledWith({ id: 1 });
      expect(updateMock).toHaveBeenCalledWith({ package_info_id: 1 });
    });

    test('{ should have returned the inserted row }', async () => {
      const r = await model.createPackageInfo(1, 'Foo', 'Bar', '2020-10-12');
      expect(r).toEqual({ id: 1, title: 'Foo' });
    });

    test('{ should throw error if db insert encounters error }', async () => {
      dbMock.insert.mockRejectedValue('e');
      try {
        await model.createPackageInfo(1, 'Foo', 'Bar', '2020-10-12');
      } catch (e) {
        expect(e).not.toBeNull();
        expect(e.message).toEqual('DatabaseError');
      }
    });

    test('{ should throw error if db retrieve encounters error }', async () => {
      dbMock.where.mockRejectedValue('e');

      try {
        await model.createPackageInfo(1, 'Foo', 'Bar', '2020-10-12');
      } catch (e) {
        expect(e).not.toBeNull();
        expect(e.message).toEqual('DatabaseError');
      }
    });

    test('{ should throw error if db update encounters error }', async () => {
      updateMock.mockRejectedValue('e');

      try {
        await model.createPackageInfo(1, 'Foo', 'Bar', '2020-10-12');
      } catch (e) {
        expect(e).not.toBeNull();
        expect(e.message).toEqual('DatabaseError');
      }
    });
  });
});
