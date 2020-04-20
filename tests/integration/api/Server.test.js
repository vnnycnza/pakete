'use strict';

const axios = require('axios');
const url = 'http://localhost:3002';

describe('[ API - Server ]', () => {
  beforeEach(() => {});

  describe('{ /api/packages }', () => {
    test('response should be an array of packages', async () => {
      let response = await axios.get(`${url}/api/packages`);
      response = response.data;

      expect(response).not.toBeNull();
      expect(response).toHaveProperty('packages', expect.any(Array));
      expect(response.packages.length).toBe(5);

      const packages = response.packages;
      // eslint-disable-next-line array-callback-return
      packages.map(p => {
        expect(p).toHaveProperty('id', expect.any(Number));
        expect(p).toHaveProperty('name', expect.any(String));
        expect(p).toHaveProperty('version', expect.any(String));
        expect(p).toHaveProperty('title', expect.any(String));
        expect(p).toHaveProperty('description', expect.any(String));
        expect(p).toHaveProperty('publication', expect.any(String));
        expect(p).toHaveProperty('authors', expect.any(Array));
        expect(p).toHaveProperty('maintainers', expect.any(Array));

        expect(p.authors[0]).toHaveProperty('name', expect.any(String));
        expect(p.authors[0]).toHaveProperty('email', expect.any(String));

        expect(p.maintainers[0]).toHaveProperty('name', expect.any(String));
        expect(p.maintainers[0]).toHaveProperty('email', expect.any(String));
      });
    });
  });

  describe('{ /api/authors }', () => {
    test('response should be an array of authors', async () => {
      let response = await axios.get(`${url}/api/authors`);
      response = response.data;

      expect(response).not.toBeNull();
      expect(response).toHaveProperty('authors', expect.any(Array));
      expect(response.authors.length).toBeGreaterThanOrEqual(5);

      const authors = response.authors;

      // eslint-disable-next-line array-callback-return
      authors.map(a => {
        expect(a).toHaveProperty('id', expect.any(Number));
        expect(a).toHaveProperty('name', expect.any(String));
        expect(a).toHaveProperty('email', expect.any(String));
      });
    });
  });

  describe('{ /api/search }', () => {
    describe('when no q is provided', () => {
      test("response should be { error: 'Invalid search keyword' }", async () => {
        let response = await axios.get(`${url}/api/search`, {
          validateStatus: null,
        });
        expect(response.status).toBe(400);
        response = response.data;
        expect(response.error).not.toBeNull();
        expect(response.error).not.toBeNull();
        expect(response.error).toEqual('Invalid search parameters');
      });
    });

    describe('when q is valid', () => {
      test('response should be { packages: array of matching packages }', async () => {
        let response = await axios.get(`${url}/api/search?q=a`);
        response = response.data;

        expect(response).not.toBeNull();
        expect(response).toHaveProperty('packages', expect.any(Array));
        expect(response.packages.length).toBe(5);

        const packages = response.packages;
        // eslint-disable-next-line array-callback-return
        packages.map(p => {
          expect(p).toHaveProperty('id', expect.any(Number));
          expect(p).toHaveProperty('name', expect.any(String));
          expect(p).toHaveProperty('version', expect.any(String));
          expect(p).toHaveProperty('title', expect.any(String));
          expect(p).toHaveProperty('description', expect.any(String));
          expect(p).toHaveProperty('publication', expect.any(String));
          expect(p).toHaveProperty('authors', expect.any(Array));
          expect(p).toHaveProperty('maintainers', expect.any(Array));

          expect(p.authors[0]).toHaveProperty('name', expect.any(String));
          expect(p.authors[0]).toHaveProperty('email', expect.any(String));

          expect(p.maintainers[0]).toHaveProperty('name', expect.any(String));
          expect(p.maintainers[0]).toHaveProperty('email', expect.any(String));
        });
      });
    });

    describe('when no match', () => {
      test('response should be { packages: empty array }', async () => {
        let response = await axios.get(`${url}/api/search?q=zzzz`);
        response = response.data;

        expect(response).not.toBeNull();
        expect(response).toHaveProperty('packages', expect.any(Array));
        expect(response.packages.length).toBe(0);
      });
    });
  });
});
