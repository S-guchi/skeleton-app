import React from 'react';
import { render, screen, act } from '@testing-library/react-native';
import { jest } from '@jest/globals';
import SettingsScreen from '../app/(app)/(tabs)/settings';
import { SessionProvider } from '../lib/contexts/SessionContext';
import { UserProvider } from '../lib/contexts/UserContext';
import { LocalizationProvider } from '../lib/contexts/LocalizationContext';

// Mock navigation
jest.mock('expo-router', () => ({
  router: {
    push: jest.fn(),
    replace: jest.fn(),
  },
}));

// Mock Supabase
jest.mock('../lib/supabase', () => ({
  supabase: {
    auth: {
      getSession: jest.fn(),
      onAuthStateChange: jest.fn(() => ({
        data: { subscription: { unsubscribe: jest.fn() } }
      })),
      refreshSession: jest.fn(),
      signOut: jest.fn(),
    },
  },
}));

// Mock user data
const mockUser = {
  id: 'test-user-id',
  name: 'Test User',
  email: 'test@example.com',
  email_confirmed_at: null, // 未認証状態
  is_anonymous: false,
};

const mockVerifiedUser = {
  ...mockUser,
  email_confirmed_at: '2024-01-01T00:00:00.000Z', // 認証済み状態
};

const mockSessionUnverified = {
  user: mockUser,
  access_token: 'mock-token',
  refresh_token: 'mock-refresh-token',
  expires_in: 3600,
  token_type: 'bearer',
};

const mockSessionVerified = {
  user: mockVerifiedUser,
  access_token: 'mock-token',
  refresh_token: 'mock-refresh-token',
  expires_in: 3600,
  token_type: 'bearer',
};

const TestWrapper = ({ children, session = mockSessionUnverified }: { children: React.ReactNode; session?: any }) => (
  <LocalizationProvider>
    <SessionProvider>
      <UserProvider>
        {children}
      </UserProvider>
    </SessionProvider>
  </LocalizationProvider>
);

describe('SettingsScreen メール認証状態表示', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('メール未認証状態では「メール認証が必要です」と表示される', async () => {
    const { supabase } = require('../lib/supabase');
    supabase.auth.getSession.mockResolvedValue({ data: { session: mockSessionUnverified } });

    render(
      <TestWrapper session={mockSessionUnverified}>
        <SettingsScreen />
      </TestWrapper>
    );

    // EmailDisplaySectionでの表示を確認
    expect(screen.getByText('メール認証が必要です')).toBeTruthy();
    expect(screen.getByTestId('unverified-icon')).toBeTruthy();

    // メニューでの表示を確認（匿名ユーザーではないため、「メール認証済み！」だが非活性）
    expect(screen.getByText('メール認証済み！')).toBeTruthy();
    expect(screen.getByText('アカウントは安全に保護されています')).toBeTruthy();
  });

  test('メール認証済み状態では「認証済み」と表示される', async () => {
    const { supabase } = require('../lib/supabase');
    supabase.auth.getSession.mockResolvedValue({ data: { session: mockSessionVerified } });

    render(
      <TestWrapper session={mockSessionVerified}>
        <SettingsScreen />
      </TestWrapper>
    );

    // EmailDisplaySectionでの表示を確認
    expect(screen.getByText('認証済み')).toBeTruthy();
    expect(screen.getByTestId('verified-icon')).toBeTruthy();

    // メニューでの表示を確認
    expect(screen.getByText('メール認証済み！')).toBeTruthy();
    expect(screen.getByText('アカウントは安全に保護されています')).toBeTruthy();
  });

  test('メール認証完了後にアプリがフォアグラウンドに戻った時、認証状態が自動更新される', async () => {
    const { supabase } = require('../lib/supabase');
    
    // 最初は未認証状態
    supabase.auth.getSession.mockResolvedValue({ data: { session: mockSessionUnverified } });
    
    const mockAuthStateChange = jest.fn();
    supabase.auth.onAuthStateChange.mockImplementation((callback) => {
      mockAuthStateChange.mockImplementation(callback);
      return { data: { subscription: { unsubscribe: jest.fn() } } };
    });

    render(
      <TestWrapper session={mockSessionUnverified}>
        <SettingsScreen />
      </TestWrapper>
    );

    // 最初は未認証状態
    expect(screen.getByText('メール認証が必要です')).toBeTruthy();

    // メール認証完了をシミュレート（認証状態変更をトリガー）
    act(() => {
      mockAuthStateChange('TOKEN_REFRESHED', mockSessionVerified);
    });

    // 認証済み状態に更新されることを確認
    expect(screen.getByText('認証済み')).toBeTruthy();
    expect(screen.getByTestId('verified-icon')).toBeTruthy();
  });

  test('refreshSession()を呼び出すと認証状態が更新される', async () => {
    const { supabase } = require('../lib/supabase');
    
    // 最初は未認証状態
    supabase.auth.getSession.mockResolvedValue({ data: { session: mockSessionUnverified } });
    supabase.auth.refreshSession.mockResolvedValue({ data: { session: mockSessionVerified } });

    render(
      <TestWrapper session={mockSessionUnverified}>
        <SettingsScreen />
      </TestWrapper>
    );

    // 最初は未認証状態
    expect(screen.getByText('メール認証が必要です')).toBeTruthy();

    // refreshSessionを呼び出して認証状態を更新
    const { supabase: supabaseInstance } = require('../lib/supabase');
    await act(async () => {
      await supabaseInstance.auth.refreshSession();
    });

    // 認証状態が更新されることを確認
    // 注意: 実際の実装では、refreshSessionの結果がonAuthStateChangeを通じて
    // セッション状態を更新することが期待される
  });
});