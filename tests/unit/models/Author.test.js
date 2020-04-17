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

  describe('{ createAuthor }', () => {
    beforeEach(() => {
      dbMock = {
        insert: jest.fn().mockReturnValue([1]),
        where: jest
          .fn()
          .mockReturnValue([{ id: 1, name: 'Foo', email: 'foo@bar.com' }]),
      };
      mockKnex = jest.fn().mockImplementation(() => dbMock);
      model = new Author(mockKnex);
    });

    test('{ should have inserted values to authors table }', async () => {
      await model.createAuthor('Foo', 'foo@bar.com');
      expect(mockKnex).toHaveBeenCalledWith('authors');
      expect(dbMock.insert).toHaveBeenCalledWith({
        email: 'foo@bar.com',
        name: 'Foo',
      });
    });

    test('{ should have retrieved inserted row by returned id }', async () => {
      await model.createAuthor('Foo', 'foo@bar.com');
      expect(mockKnex).toHaveBeenCalledWith('authors');
      expect(dbMock.where).toHaveBeenCalledWith('id', 1);
    });

    test('{ should have returned the inserted row }', async () => {
      const r = await model.createAuthor('Foo', 'foo@bar.com');
      expect(r).toEqual({ id: 1, name: 'Foo', email: 'foo@bar.com' });
    });

    test('{ should throw error if db insert encounters error }', async () => {
      dbMock.insert.mockRejectedValue('e');
      try {
        await model.createAuthor('Foo', 'foo@bar.com');
      } catch (e) {
        expect(e).not.toBeNull();
        expect(e.message).toEqual('DatabaseError');
      }
    });

    test('{ should throw error if db retrieve encounters error }', async () => {
      dbMock.where.mockRejectedValue('e');
      try {
        await model.createAuthor('Foo', 'foo@bar.com');
      } catch (e) {
        expect(e).not.toBeNull();
        expect(e.message).toEqual('DatabaseError');
      }
    });
  });

  describe('{ getAuthorById }', () => {
    beforeEach(() => {
      dbMock = {
        where: jest
          .fn()
          .mockReturnValue([{ id: 1, name: 'Foo', email: 'foo@bar.com' }]),
      };
      mockKnex = jest.fn().mockImplementation(() => dbMock);
      model = new Author(mockKnex);
    });

    test('{ should have retrieved from authors table by id  }', async () => {
      await model.getAuthorById(1);
      expect(mockKnex).toHaveBeenCalledWith('authors');
      expect(dbMock.where).toHaveBeenCalledWith('id', 1);
    });

    test('{ should have returned the retrieved row }', async () => {
      const r = await model.getAuthorById(1);
      expect(r).toEqual({ id: 1, name: 'Foo', email: 'foo@bar.com' });
    });

    test('{ should throw error if db retrieve encounters error }', async () => {
      dbMock.where.mockRejectedValue('e');

      try {
        await model.getAuthorById(1);
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
      expect(dbMock.select).toHaveBeenCalled();
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
