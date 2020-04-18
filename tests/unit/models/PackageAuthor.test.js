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

  describe('{ getAllPackageAuthorsByIds }', () => {
    let whereInMock;
    let leftJoinMock;
    let fromMock;

    beforeEach(() => {
      whereInMock = jest.fn().mockReturnValue([
        { name: 'a', email: 'b', c: 'author' },
        { name: 'a', email: 'b', c: 'maintainer' },
      ]);
      leftJoinMock = jest.fn().mockImplementation(() => ({
        whereIn: whereInMock,
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

    test('{ should have selected columns }', async () => {
      await model.getAllPackageAuthorsByIds([1, 2, 3]);
      expect(dbMock.select).toHaveBeenCalledTimes(1);
      expect(dbMock.select).toHaveBeenCalledWith([
        'authors.name',
        'authors.email',
        'package_authors.type',
        'package_authors.package_info_id',
      ]);
    });

    test('{ should have selected from package_authors table', async () => {
      await model.getAllPackageAuthorsByIds([1, 2, 3]);
      expect(fromMock).toHaveBeenCalledTimes(1);
      expect(fromMock).toHaveBeenCalledWith('package_authors');
    });

    test('{ should have left join authors table on package_authors.author_id = authors.id', async () => {
      await model.getAllPackageAuthorsByIds([1, 2, 3]);
      expect(leftJoinMock).toHaveBeenCalledTimes(1);
      expect(leftJoinMock).toHaveBeenCalledWith(
        'authors',
        'package_authors.author_id',
        'authors.id',
      );
    });

    test('{ should have filtered where package_info_id = input', async () => {
      await model.getAllPackageAuthorsByIds([1, 2, 3]);
      expect(whereInMock).toHaveBeenCalledTimes(1);
      expect(
        whereInMock,
      ).toHaveBeenCalledWith('package_authors.package_info_id', [1, 2, 3]);
    });

    test('{ should have returned the retrieved rows }', async () => {
      const r = await model.getAllPackageAuthorsByIds(1);
      expect(r).toEqual([
        { name: 'a', email: 'b', c: 'author' },
        { name: 'a', email: 'b', c: 'maintainer' },
      ]);
    });

    test('{ should return empty array when no results retrieved }', async () => {
      whereInMock.mockReturnValue([]);

      const r = await model.getAllPackageAuthorsByIds(1);
      expect(r).toEqual([]);
    });

    test('{ should throw error if db retrieve encounters error }', async () => {
      whereInMock.mockRejectedValue('e');

      try {
        await model.getAllPackageAuthorsByIds(1);
      } catch (e) {
        expect(e).not.toBeNull();
        expect(e.message).toEqual('DatabaseError');
      }
    });
  });

  describe('{ createPackageAuthors }', () => {
    let sample;

    beforeEach(() => {
      sample = [
        { author_id: 1, package_info_id: 1 },
        { author_id: 2, package_info_id: 2 },
      ];
      dbMock = {
        batchInsert: jest.fn().mockReturnValue([1]),
      };
      mockKnex = dbMock;
      model = new PackageAuthor(mockKnex);
    });

    test('{ should have called batch insert to package_authors table }', async () => {
      await model.createPackageAuthors(sample);
      expect(dbMock.batchInsert).toHaveBeenCalledTimes(1);
      expect(dbMock.batchInsert).toHaveBeenCalledWith(
        'package_authors',
        sample,
        1000,
      );
    });

    test('{ should have returned null }', async () => {
      const r = await model.createPackageAuthors(sample);
      expect(r).toBeNull();
    });

    test('{ should throw error if db batchInsert encounters error }', async () => {
      dbMock.batchInsert.mockRejectedValue('e');
      try {
        await model.createPackageAuthors(sample);
      } catch (e) {
        expect(e).not.toBeNull();
        expect(e.message).toEqual('DatabaseError');
      }
    });
  });
});
