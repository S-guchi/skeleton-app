// Unit test setup - minimal mocks
global.console = {
  ...console,
  warn: jest.fn(),
  error: jest.fn(),
};

// グローバル変数の定義
global.__DEV__ = false;
global.__EXPO__ = true;