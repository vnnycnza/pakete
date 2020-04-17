'use strict';

module.exports = {
  verbose: true,
  bail: true,
  testEnvironment: 'node',
  collectCoverage: true,
  coverageDirectory: '.tmp/unit',
  collectCoverageFrom: ['models/*.js', '!**/node_modules/**'],
  setupFilesAfterEnv: ['<rootDir>/tests/unit/setup.js'],
  restoreMocks: true,
  clearMocks: true,
  resetModules: true,
};
