// Unit tests specific Jest configuration (without expo preset)
module.exports = {
  testEnvironment: 'node',
  testMatch: ['<rootDir>/__tests__/**/*.test.{js,ts,tsx}'],
  moduleFileExtensions: ['js', 'ts', 'tsx', 'json'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/$1',
  },
  transform: {
    '^.+\\.(ts|tsx)$': 'babel-jest',
  },
  collectCoverageFrom: [
    'lib/**/*.{js,ts}',
    'components/**/*.{js,ts,tsx}',
    'db/**/*.{js,ts}',
    '!**/*.d.ts',
    '!**/node_modules/**',
    '!**/*.test.{js,ts}',
    '!**/__tests__/**',
  ],
  coverageReporters: ['text', 'lcov', 'html'],
  coverageDirectory: 'coverage',
  // Simple setup
  setupFilesAfterEnv: ['<rootDir>/jest.unit.setup.js'],
};