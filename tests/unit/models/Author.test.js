'use strict';

const Author = require('../../../models/Author');
describe('[ Models - Author ]', () => {
  let model;
  let mockKnex;
  let dbMock;

  describe('{ constructor }', () => {
    mockKnex = jest.fn();
    model = new Author(mockKnex);

    test('{ should assign db instance }', () => {
      expect(model._db).not.toBe(null);
    });
  });

  describe('{ createAuthors }', () => {
    let sample;

    beforeEach(() => {
      sample = [{ name: 'Foo' }, { name: 'Bar' }];
      dbMock = {
        batchInsert: jest.fn().mockReturnValue([1]),
      };
      mockKnex = dbMock;
      model = new Author(mockKnex);
    });

    test('{ should have called batch insert to authors table }', async () => {
      await model.createAuthors(sample);
      expect(dbMock.batchInsert).toHaveBeenCalledTimes(1);
      expect(dbMock.batchInsert).toHaveBeenCalledWith('authors', sample, 1000);
    });

    test('{ should have returned null }', async () => {
      const r = await model.createAuthors(sample);
      expect(r).toBeNull();
    });

    test('{ should throw error if db batchInsert encounters error }', async () => {
      dbMock.batchInsert.mockRejectedValue('e');
      try {
        await model.createAuthors(sample);
      } catch (e) {
        expect(e).not.toBeNull();
        expect(e.message).toEqual('DatabaseError');
      }
    });
  });

  describe('{ getAllAuthors }', () => {
    let tableMock;

    beforeEach(() => {
      tableMock = jest.fn().mockReturnValue([{ id: 1 }, { id: 2 }]);
      dbMock = {
        select: jest.fn().mockImplementation(() => ({
          table: tableMock,
        })),
      };
      model = new Author(dbMock);
    });

    test('{ should have called select from authors table }', async () => {
      await model.getAllAuthors();
      expect(dbMock.select).toHaveBeenCalledTimes(1);
      expect(tableMock).toHaveBeenCalledWith('authors');
    });

    test('{ should have returned the retrieved rows }', async () => {
      const r = await model.getAllAuthors();
      expect(r).toEqual([{ id: 1 }, { id: 2 }]);
    });

    test('{ should throw error if db retrieve encounters error }', async () => {
      tableMock.mockRejectedValue('e');

      try {
        await model.getAllAuthors();
      } catch (e) {
        expect(e).not.toBeNull();
        expect(e.message).toEqual('DatabaseError');
      }
    });
  });
});
