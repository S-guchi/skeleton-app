module.exports = {
  preset: 'jest-expo',
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json'],
  transformIgnorePatterns: [
    'node_modules/(?!((jest-)?react-native|@react-native(-community)?|expo(nent)?|@expo(nent)?/.*|@expo-google-fonts/.*|react-navigation|@react-navigation/.*|@unimodules/.*|unimodules|sentry-expo|native-base|react-native-svg|clsx|react-native-url-polyfill|@supabase|expo-modules-core|react-native-css-interop|lucide-react-native|expo-clipboard|expo-haptics|expo-image-picker|expo-image|expo-asset)/)',
  ],
  testPathIgnorePatterns: [
    '/node_modules/', 
    '/android/', 
    '/ios/', 
    '__tests__/testUtils.tsx',
    '__tests__/core-functions.test.ts', // TypeScript version conflicts with Expo
    '__tests__/navigation.test.tsx', // Has dependency issues
    '__tests__/app/\\(tabs\\)/index.test.tsx', // css-interop compatibility issues
    '__tests__/app/\\(tabs\\)/settings.test.tsx', // css-interop compatibility issues
    '__tests__/app/household/create-with-invite.test.tsx', // css-interop compatibility issues
    '__tests__/app/household/join-with-invite.test.tsx', // css-interop compatibility issues
    '__tests__/app/terms-of-service.test.tsx', // css-interop compatibility issues
    '__tests__/app/privacy-policy.test.tsx', // css-interop compatibility issues
    '__tests__/app/account-deletion.test.tsx', // css-interop compatibility issues
    '__tests__/screens/welcome.test.tsx', // css-interop compatibility issues
    '__tests__/components/EmailDisplaySection.test.tsx', // css-interop compatibility issues
    '__tests__/settings-email-verification-display.test.tsx', // css-interop compatibility issues
    '__tests__/email-upgrade-loading.test.tsx', // css-interop compatibility issues
    '__tests__/lib/contexts/NotificationContext.test.tsx', // Memory issues
  ],
  collectCoverageFrom: [
    'app/**/*.{js,jsx,ts,tsx}',
    'components/**/*.{js,jsx,ts,tsx}',
    'lib/**/*.{js,jsx,ts,tsx}',
    '!**/*.d.ts',
    '!**/node_modules/**',
  ],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/$1',
  },
  // Use different test environments for different test patterns
  projects: [
    {
      displayName: 'unit',
      testEnvironment: 'node',
      testMatch: ['<rootDir>/__tests__/**/*.test.js'],
      setupFilesAfterEnv: ['<rootDir>/jest.unit.setup.js'],
      moduleNameMapper: {
        '^@/(.*)$': '<rootDir>/$1',
      },
      transformIgnorePatterns: [],
    },
    {
      displayName: 'expo',
      preset: 'jest-expo',
      testMatch: ['<rootDir>/__tests__/**/*.test.{tsx,ts}'],
      testPathIgnorePatterns: [
        '/node_modules/', 
        '/android/', 
        '/ios/', 
        '__tests__/testUtils.tsx',
        '__tests__/core-functions.test.ts',
        '__tests__/navigation.test.tsx',
        '__tests__/app/\\(tabs\\)/index.test.tsx',
        '__tests__/app/\\(tabs\\)/settings.test.tsx',
        '__tests__/app/household/create-with-invite.test.tsx',
        '__tests__/app/household/join-with-invite.test.tsx',
        '__tests__/app/terms-of-service.test.tsx',
        '__tests__/app/privacy-policy.test.tsx',
        '__tests__/app/account-deletion.test.tsx',
        '__tests__/screens/welcome.test.tsx',
        '__tests__/components/EmailDisplaySection.test.tsx',
        '__tests__/settings-email-verification-display.test.tsx',
        '__tests__/email-upgrade-loading.test.tsx',
        '__tests__/lib/contexts/NotificationContext.test.tsx',
      ],
      setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
      transformIgnorePatterns: [
        'node_modules/(?!((jest-)?react-native|@react-native(-community)?|expo(nent)?|@expo(nent)?/.*|@expo-google-fonts/.*|react-navigation|@react-navigation/.*|@unimodules/.*|unimodules|sentry-expo|native-base|react-native-svg|clsx|react-native-url-polyfill|@supabase|expo-modules-core|react-native-css-interop|lucide-react-native|expo-clipboard|expo-haptics|expo-image-picker|expo-image|expo-asset)/)',
      ],
      moduleNameMapper: {
        '^@/(.*)$': '<rootDir>/$1',
      },
    },
  ],
};