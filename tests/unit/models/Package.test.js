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

  describe('{ createPackage }', () => {
    beforeEach(() => {
      dbMock = {
        insert: jest.fn().mockReturnValue([1]),
        where: jest
          .fn()
          .mockReturnValue([{ id: 1, package: 'ABC', version: '1.0.0' }]),
      };
      mockKnex = jest.fn().mockImplementation(() => dbMock);
      model = new Package(mockKnex);
    });

    test('{ should have inserted values to authors table }', async () => {
      await model.createPackage('ABC', '1.0.0');
      expect(mockKnex).toHaveBeenCalledWith('packages');
      expect(dbMock.insert).toHaveBeenCalledWith({
        package: 'ABC',
        version: '1.0.0',
      });
    });

    test('{ should have retrieved inserted row by returned id }', async () => {
      await model.createPackage('ABC', '1.0.0');
      expect(mockKnex).toHaveBeenCalledWith('packages');
      expect(dbMock.where).toHaveBeenCalledWith('id', 1);
    });

    test('{ should have returned the inserted row }', async () => {
      const r = await model.createPackage('ABC', '1.0.0');
      expect(r).toEqual({ id: 1, package: 'ABC', version: '1.0.0' });
    });

    test('{ should throw error if db insert encounters error }', async () => {
      dbMock.insert.mockRejectedValue('e');
      try {
        await model.createPackage('ABC', '1.0.0');
      } catch (e) {
        expect(e).not.toBeNull();
        expect(e.message).toEqual('DatabaseError');
      }
    });

    test('{ should throw error if db retrieve encounters error }', async () => {
      dbMock.where.mockRejectedValue('e');
      try {
        await model.createPackage('ABC', '1.0.0');
      } catch (e) {
        expect(e).not.toBeNull();
        expect(e.message).toEqual('DatabaseError');
      }
    });
  });

  describe('{ getAllPackages }', () => {
    let tableMock;

    beforeEach(() => {
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
      expect(dbMock.select).toHaveBeenCalled();
      expect(tableMock).toHaveBeenCalledWith('packages');
    });

    test('{ should have returned the retrieved rows }', async () => {
      const r = await model.getAllPackages();
      expect(r).toEqual([{ id: 1 }, { id: 2 }]);
    });

    test('{ should throw error if db retrieve encounters error }', async () => {
      tableMock.mockRejectedValue('e');

      try {
        await model.getAllPackages();
      } catch (e) {
        expect(e).not.toBeNull();
        expect(e.message).toEqual('DatabaseError');
      }
    });
  });
});
