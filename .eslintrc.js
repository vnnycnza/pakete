'use strict';

module.exports = {
  env: {
    browser: false,
    node: true,
    es6: true,
  },
  extends: ['eslint:recommended', 'airbnb-base/legacy', 'prettier'],
  globals: {
    jest: 'readonly',
    describe: 'readonly',
    beforeEach: 'readonly',
    expect: 'readonly',
    test: 'readonly',
    before: 'readonly',
    afterEach: 'readonly',
    consoleErrorSpy: 'readonly',
  },
  parserOptions: {
    ecmaVersion: 2018,
    ecmaFeatures: {
      generators: false,
      objectLiteralShorthandProperties: true,
      objectLiteralShorthandMethods: true,
      objectLiteralDuplicateProperties: false,
    },
  },
  rules: {
    'no-console': 0,
    'no-underscore-dangle': 0,
    'require-jsdoc': 'error',
    'global-require': 0,
    'no-restricted-syntax': 0,
    'no-await-in-loop': 0,
    'no-param-reassign': 0,
    camelcase: 0,
    'valid-jsdoc': [
      2,
      {
        prefer: {
          return: 'return',
          throw: 'throws',
        },
        requireReturn: true,
        requireParamDescription: false,
        requireReturnDescription: false,
        requireReturnType: true,
        preferType: {
          string: 'String',
          object: 'Object',
          number: 'Number',
          boolean: 'Boolean',
          function: 'Function',
        },
      },
    ],
    quotes: ['error', 'single', { avoidEscape: true }],
  },
};
