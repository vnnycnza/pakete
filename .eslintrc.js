'use strict';

module.exports = {
  env: {
    browser: false,
    node: true,
    es6: true,
  },
  extends: ['eslint:recommended', 'airbnb-base/legacy', 'prettier'],
  globals: {},
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
    'require-jsdoc': 'error',
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
