// Jest setup for Expo project - Expoプロジェクト用のJest設定

// Mock Expo winter module that's causing issues
jest.mock('expo/src/winter/runtime.native.ts', () => ({}), { virtual: true });

// Mock React Hook Form - React Hook Formのモック
jest.mock('react-hook-form', () => ({
  useForm: () => ({
    control: {},
    handleSubmit: (fn: any) => (e: any) => {
      // 実際のフォームデータを模擬
      const mockData = {
        email: 'test@example.com',
        password: 'password123',
        name: 'テストユーザー',
        confirmPassword: 'password123'
      };
      return fn(mockData);
    },
    formState: { errors: {} },
  }),
  Controller: ({ render }: any) => render({ field: { onChange: jest.fn(), onBlur: jest.fn(), value: '' } }),
}));

// Mock zod resolver - zodリゾルバーのモック
jest.mock('@hookform/resolvers/zod', () => ({
  zodResolver: jest.fn(),
}));

// Mock react-native-url-polyfill
jest.mock('react-native-url-polyfill/auto', () => {});

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () => ({
  default: {
    getItem: jest.fn(),
    setItem: jest.fn(),
    removeItem: jest.fn(),
    clear: jest.fn(),
  },
}));

// Mock Supabase
jest.mock('@supabase/supabase-js', () => ({
  createClient: jest.fn(() => ({
    auth: {
      onAuthStateChange: jest.fn(() => ({ data: { subscription: { unsubscribe: jest.fn() } } })),
      getSession: jest.fn(() => Promise.resolve({ data: { session: null }, error: null })),
      signIn: jest.fn(),
      signUp: jest.fn(),
      signOut: jest.fn(),
    },
    from: jest.fn(() => ({
      select: jest.fn().mockReturnThis(),
      insert: jest.fn().mockReturnThis(),
      update: jest.fn().mockReturnThis(),
      delete: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      single: jest.fn(),
    })),
  })),
}));

// Mock expo-secure-store
jest.mock('expo-secure-store', () => ({
  getItemAsync: jest.fn(),
  setItemAsync: jest.fn(),
  deleteItemAsync: jest.fn(),
}));

// Mock lucide-react-native
jest.mock('lucide-react-native', () => ({
  ChevronRight: 'ChevronRight',
  Check: 'Check',
  X: 'X',
  Home: 'Home',
  User: 'User',
  Settings: 'Settings',
}));

// Mock react-native-css-interop
jest.mock('react-native-css-interop', () => ({
  cn: (...args) => args.filter(Boolean).join(' '),
  clsx: (...args) => args.filter(Boolean).join(' '),
}));

// Mock react-native-css-interop runtime
jest.mock('react-native-css-interop/src/runtime/third-party-libs/react-native-safe-area-context.native', () => ({}));

// Mock react-native-safe-area-context
jest.mock('react-native-safe-area-context', () => {
  const MockSafeAreaProvider = ({ children }) => children;
  MockSafeAreaProvider.displayName = 'SafeAreaProvider';
  
  const MockSafeAreaView = ({ children }) => children;
  MockSafeAreaView.displayName = 'SafeAreaView';
  
  return {
    SafeAreaProvider: MockSafeAreaProvider,
    SafeAreaView: MockSafeAreaView,
    useSafeAreaInsets: () => ({ top: 0, right: 0, bottom: 0, left: 0 }),
  };
});

// テスト中のコンソール警告を無効化
global.console = {
  ...console,
  warn: jest.fn(),
  error: jest.fn(),
};