'use strict';

const PackageAuthor = require('../../../models/PackageAuthor');

describe('[ Models - PackageAuthor ]', () => {
  let model;
  let mockKnex;
  let dbMock;

  describe('{ constructor }', () => {
    mockKnex = jest.fn();
    model = new PackageAuthor(mockKnex);
    test('{ should assign db instance }', () => {
      expect(model._db).not.toBe(null);
    });
  });

  describe('{ createPackageAuthor }', () => {
    beforeEach(() => {
      dbMock = {
        insert: jest.fn().mockReturnValue([1]),
        where: jest
          .fn()
          .mockReturnValue([
            { id: 1, type: 'author', author_id: 1, package_info_id: 1 },
          ]),
      };
      mockKnex = jest.fn().mockImplementation(() => dbMock);
      model = new PackageAuthor(mockKnex);
    });

    test('{ should have inserted values to package_authors table }', async () => {
      await model.createPackageAuthor(1, 1);
      expect(mockKnex).toHaveBeenCalledWith('package_authors');
      expect(dbMock.insert).toHaveBeenCalledWith({
        author_id: 1,
        package_info_id: 1,
        type: 'author',
      });
    });

    test('{ should have retrieved inserted row by returned id }', async () => {
      await model.createPackageAuthor(1, 1);
      expect(mockKnex).toHaveBeenCalledWith('package_authors');
      expect(dbMock.where).toHaveBeenCalledWith('id', 1);
    });

    test('{ should have returned the inserted row }', async () => {
      const r = await model.createPackageAuthor(1, 1);
      expect(r).toEqual({
        id: 1,
        type: 'author',
        author_id: 1,
        package_info_id: 1,
      });
    });

    test('{ should throw error if db insert encounters error }', async () => {
      dbMock.insert.mockRejectedValue('e');
      try {
        await model.createPackageAuthor(1, 1);
      } catch (e) {
        expect(e).not.toBeNull();
        expect(e.message).toEqual('DatabaseError');
      }
    });

    test('{ should throw error if db retrieve encounters error }', async () => {
      dbMock.where.mockRejectedValue('e');
      try {
        await model.createPackageAuthor(1, 1);
      } catch (e) {
        expect(e).not.toBeNull();
        expect(e.message).toEqual('DatabaseError');
      }
    });
  });

  describe('{ createPackageMaintainer }', () => {
    beforeEach(() => {
      dbMock = {
        insert: jest.fn().mockReturnValue([1]),
        where: jest
          .fn()
          .mockReturnValue([
            { id: 1, type: 'maintainer', author_id: 1, package_info_id: 1 },
          ]),
      };
      mockKnex = jest.fn().mockImplementation(() => dbMock);
      model = new PackageAuthor(mockKnex);
    });

    test('{ should have inserted values to package_authors table }', async () => {
      await model.createPackageMaintainer(1, 1);
      expect(mockKnex).toHaveBeenCalledWith('package_authors');
      expect(dbMock.insert).toHaveBeenCalledWith({
        author_id: 1,
        package_info_id: 1,
        type: 'maintainer',
      });
    });

    test('{ should have returned the inserted row }', async () => {
      const r = await model.createPackageMaintainer(1, 1);
      expect(r).toEqual({
        id: 1,
        type: 'maintainer',
        author_id: 1,
        package_info_id: 1,
      });
    });

    test('{ should throw error if db insert encounters error }', async () => {
      dbMock.insert.mockRejectedValue('e');
      try {
        await model.createPackageMaintainer(1, 1);
      } catch (e) {
        expect(e).not.toBeNull();
        expect(e.message).toEqual('DatabaseError');
      }
    });

    test('{ should throw error if db retrieve encounters error }', async () => {
      dbMock.where.mockRejectedValue('e');
      try {
        await model.createPackageMaintainer(1, 1);
      } catch (e) {
        expect(e).not.toBeNull();
        expect(e.message).toEqual('DatabaseError');
      }
    });
  });

  describe('{ getAllPackageAuthorsById }', () => {
    let whereMock;
    let leftJoinMock;
    let fromMock;

    beforeEach(() => {
      whereMock = jest.fn().mockReturnValue([
        { name: 'a', email: 'b', c: 'author' },
        { name: 'a', email: 'b', c: 'maintainer' },
      ]);
      leftJoinMock = jest.fn().mockImplementation(() => ({
        where: whereMock,
      }));
      fromMock = jest.fn().mockImplementation(() => ({
        leftJoin: leftJoinMock,
      }));
      dbMock = {
        select: jest.fn().mockImplementation(() => ({
          from: fromMock,
        })),
      };
      model = new PackageAuthor(dbMock);
    });

    test('{ should have called select [ name, email, type ] }', async () => {
      await model.getAllPackageAuthorsById(1);
      expect(dbMock.select).toHaveBeenCalledTimes(1);
      expect(dbMock.select).toHaveBeenCalledWith(['name', 'email', 'type']);
    });

    test('{ should have selected from package_authors table', async () => {
      await model.getAllPackageAuthorsById(1);
      expect(fromMock).toHaveBeenCalledTimes(1);
      expect(fromMock).toHaveBeenCalledWith('package_authors');
    });

    test('{ should have left join authors table on package_authors.author_id = authors.id', async () => {
      await model.getAllPackageAuthorsById(1);
      expect(leftJoinMock).toHaveBeenCalledTimes(1);
      expect(leftJoinMock).toHaveBeenCalledWith(
        'authors',
        'package_authors.author_id',
        'authors.id',
      );
    });

    test('{ should have filtered where package_info_id = input', async () => {
      await model.getAllPackageAuthorsById(1);
      expect(whereMock).toHaveBeenCalledTimes(1);
      expect(whereMock).toHaveBeenCalledWith('package_info_id', 1);
    });

    test('{ should have returned the retrieved rows }', async () => {
      const r = await model.getAllPackageAuthorsById(1);
      expect(r).toEqual([
        { name: 'a', email: 'b', c: 'author' },
        { name: 'a', email: 'b', c: 'maintainer' },
      ]);
    });

    test('{ should return empty array when no results retrieved }', async () => {
      whereMock.mockReturnValue([]);

      const r = await model.getAllPackageAuthorsById(1);
      expect(r).toEqual([]);
    });

    test('{ should throw error if db retrieve encounters error }', async () => {
      whereMock.mockRejectedValue('e');

      try {
        await model.getAllPackageAuthorsById(1);
      } catch (e) {
        expect(e).not.toBeNull();
        expect(e.message).toEqual('DatabaseError');
      }
    });
  });
});
