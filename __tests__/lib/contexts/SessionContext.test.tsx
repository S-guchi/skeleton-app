import React from 'react';
import { render, act, waitFor } from '@testing-library/react-native';
import { SessionProvider, useSession } from '@/lib/contexts/SessionContext';
import { supabase } from '@/lib/supabase';

// モック
jest.mock('@/lib/supabase', () => ({
  supabase: {
    auth: {
      getSession: jest.fn(),
      onAuthStateChange: jest.fn(),
      refreshSession: jest.fn(),
    },
  },
}));

jest.mock('@/lib/services/authService', () => ({
  signInWithEmail: jest.fn(),
  signUpWithEmail: jest.fn(),
  signInAnonymously: jest.fn(),
  upgradeAnonymousUser: jest.fn(),
  signOut: jest.fn(),
}));

const mockSupabase = supabase as jest.Mocked<typeof supabase>;

// テスト用コンポーネント
const TestComponent = () => {
  const { session, isAuthLoading, signIn, signOut } = useSession();
  
  return (
    <>
      <div testID="session-status">
        {session ? 'authenticated' : 'not-authenticated'}
      </div>
      <div testID="loading-status">
        {isAuthLoading ? 'loading' : 'not-loading'}
      </div>
      <button testID="sign-in" onPress={() => signIn('test@example.com', 'password')}>
        Sign In
      </button>
      <button testID="sign-out" onPress={() => signOut()}>
        Sign Out
      </button>
    </>
  );
};

describe('SessionContext', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    
    // デフォルトモック設定
    mockSupabase.auth.getSession.mockResolvedValue({
      data: { session: null },
      error: null,
    });
    
    mockSupabase.auth.refreshSession.mockResolvedValue({
      data: { session: null },
      error: null,
    });
    
    mockSupabase.auth.onAuthStateChange.mockReturnValue({
      data: { subscription: { unsubscribe: jest.fn() } },
    });
  });

  it('初期状態では認証されていない', async () => {
    const { getByTestId } = render(
      <SessionProvider>
        <TestComponent />
      </SessionProvider>
    );

    await waitFor(() => {
      expect(getByTestId('session-status')).toHaveTextContent('not-authenticated');
      expect(getByTestId('loading-status')).toHaveTextContent('not-loading');
    });
  });

  it('セッションが存在する場合は認証された状態になる', async () => {
    const mockSession = {
      user: { id: 'user-1', email: 'test@example.com' },
      access_token: 'token',
    };

    mockSupabase.auth.refreshSession.mockResolvedValue({
      data: { session: mockSession },
      error: null,
    });

    const { getByTestId } = render(
      <SessionProvider>
        <TestComponent />
      </SessionProvider>
    );

    await waitFor(() => {
      expect(getByTestId('session-status')).toHaveTextContent('authenticated');
    });
  });

  it('認証状態変更リスナーが正しく動作する', async () => {
    let authStateChangeCallback: ((event: string, session: any) => void) | null = null;
    
    mockSupabase.auth.onAuthStateChange.mockImplementation((callback) => {
      authStateChangeCallback = callback;
      return {
        data: { subscription: { unsubscribe: jest.fn() } },
      };
    });

    const { getByTestId } = render(
      <SessionProvider>
        <TestComponent />
      </SessionProvider>
    );

    // 初期状態
    await waitFor(() => {
      expect(getByTestId('session-status')).toHaveTextContent('not-authenticated');
    });

    // セッション変更をシミュレート
    const mockSession = {
      user: { id: 'user-1', email: 'test@example.com' },
      access_token: 'token',
    };

    await act(async () => {
      if (authStateChangeCallback) {
        authStateChangeCallback('SIGNED_IN', mockSession);
      }
    });

    await waitFor(() => {
      expect(getByTestId('session-status')).toHaveTextContent('authenticated');
    });
  });

  it('ローディング状態が正しく管理される', async () => {
    const { signInWithEmail } = require('@/lib/services/authService');
    signInWithEmail.mockImplementation(() => new Promise(resolve => setTimeout(resolve, 100)));

    const { getByTestId } = render(
      <SessionProvider>
        <TestComponent />
      </SessionProvider>
    );

    // 初期状態
    await waitFor(() => {
      expect(getByTestId('loading-status')).toHaveTextContent('not-loading');
    });

    // サインイン実行
    act(() => {
      getByTestId('sign-in').props.onPress();
    });

    // ローディング中
    expect(getByTestId('loading-status')).toHaveTextContent('loading');

    // ローディング完了
    await waitFor(() => {
      expect(getByTestId('loading-status')).toHaveTextContent('not-loading');
    });
  });
});