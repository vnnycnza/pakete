'use strict';

beforeEach(() => {
  global.consoleErrorSpy = jest
    .spyOn(console, 'error')
    .mockImplementation(() => null);
  global.consoleLogSpy = jest
    .spyOn(console, 'log')
    .mockImplementation(() => null);
  global.consoleInfoSpy = jest
    .spyOn(console, 'info')
    .mockImplementation(() => null);
});
