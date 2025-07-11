import React from 'react';
import { render, act, waitFor } from '@testing-library/react-native';
import { UserProvider, useUser } from '@/lib/contexts/UserContext';
import { SessionProvider, useSession } from '@/lib/contexts/SessionContext';

// モック
jest.mock('@/lib/contexts/SessionContext', () => ({
  useSession: jest.fn(),
  SessionProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

jest.mock('@/lib/services/authService', () => ({
  fetchUserWithHousehold: jest.fn(),
  updateUserProfile: jest.fn(),
}));

const mockUseSession = useSession as jest.MockedFunction<typeof useSession>;

// テスト用コンポーネント
const TestComponent = () => {
  const { user, isUserLoading, updateUser, refreshUser } = useUser();
  
  return (
    <>
      <div testID="user-status">
        {user ? `user-${user.name}` : 'no-user'}
      </div>
      <div testID="loading-status">
        {isUserLoading ? 'loading' : 'not-loading'}
      </div>
      <button testID="update-user" onPress={() => updateUser({ name: 'Updated Name' })}>
        Update User
      </button>
      <button testID="refresh-user" onPress={() => refreshUser()}>
        Refresh User
      </button>
    </>
  );
};

describe('UserContext', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    
    // デフォルトモック設定
    mockUseSession.mockReturnValue({
      session: null,
      isAuthLoading: false,
      signIn: jest.fn(),
      signUp: jest.fn(),
      signInAnonymously: jest.fn(),
      upgradeToEmailUser: jest.fn(),
      signOut: jest.fn(),
      refreshSession: jest.fn(),
    });
  });

  it('セッションがない場合はユーザーデータを読み込まない', async () => {
    const { getByTestId } = render(
      <SessionProvider>
        <UserProvider>
          <TestComponent />
        </UserProvider>
      </SessionProvider>
    );

    await waitFor(() => {
      expect(getByTestId('user-status')).toHaveTextContent('no-user');
      expect(getByTestId('loading-status')).toHaveTextContent('not-loading');
    });
  });

  it('セッションがある場合はユーザーデータを読み込む', async () => {
    const { fetchUserWithHousehold } = require('@/lib/services/authService');
    
    const mockUser = {
      id: 'user-1',
      name: 'Test User',
      hasCompletedOnboarding: true,
      householdId: 'household-1',
    };

    fetchUserWithHousehold.mockResolvedValue(mockUser);

    mockUseSession.mockReturnValue({
      session: {
        user: { id: 'user-1', email: 'test@example.com' },
        access_token: 'token',
      },
      isAuthLoading: false,
      signIn: jest.fn(),
      signUp: jest.fn(),
      signInAnonymously: jest.fn(),
      upgradeToEmailUser: jest.fn(),
      signOut: jest.fn(),
      refreshSession: jest.fn(),
    });

    const { getByTestId } = render(
      <SessionProvider>
        <UserProvider>
          <TestComponent />
        </UserProvider>
      </SessionProvider>
    );

    await waitFor(() => {
      expect(getByTestId('user-status')).toHaveTextContent('user-Test User');
      expect(fetchUserWithHousehold).toHaveBeenCalledWith('user-1');
    });
  });

  it('ユーザーデータの更新が正しく動作する', async () => {
    const { updateUserProfile } = require('@/lib/services/authService');
    updateUserProfile.mockResolvedValue(undefined);

    const mockUser = {
      id: 'user-1',
      name: 'Test User',
      hasCompletedOnboarding: true,
      householdId: 'household-1',
    };

    mockUseSession.mockReturnValue({
      session: {
        user: { id: 'user-1', email: 'test@example.com' },
        access_token: 'token',
      },
      isAuthLoading: false,
      signIn: jest.fn(),
      signUp: jest.fn(),
      signInAnonymously: jest.fn(),
      upgradeToEmailUser: jest.fn(),
      signOut: jest.fn(),
      refreshSession: jest.fn(),
    });

    // 初期ユーザーデータをモック
    const { fetchUserWithHousehold } = require('@/lib/services/authService');
    fetchUserWithHousehold.mockResolvedValue(mockUser);

    const { getByTestId } = render(
      <SessionProvider>
        <UserProvider>
          <TestComponent />
        </UserProvider>
      </SessionProvider>
    );

    // 初期状態確認
    await waitFor(() => {
      expect(getByTestId('user-status')).toHaveTextContent('user-Test User');
    });

    // ユーザー更新
    await act(async () => {
      getByTestId('update-user').props.onPress();
    });

    await waitFor(() => {
      expect(updateUserProfile).toHaveBeenCalledWith('user-1', { name: 'Updated Name' });
      expect(getByTestId('user-status')).toHaveTextContent('user-Updated Name');
    });
  });

  it('ローディング状態が正しく管理される', async () => {
    const { fetchUserWithHousehold } = require('@/lib/services/authService');
    fetchUserWithHousehold.mockImplementation(() => new Promise(resolve => 
      setTimeout(() => resolve({
        id: 'user-1',
        name: 'Test User',
        hasCompletedOnboarding: true,
        householdId: 'household-1',
      }), 100)
    ));

    mockUseSession.mockReturnValue({
      session: {
        user: { id: 'user-1', email: 'test@example.com' },
        access_token: 'token',
      },
      isAuthLoading: false,
      signIn: jest.fn(),
      signUp: jest.fn(),
      signInAnonymously: jest.fn(),
      upgradeToEmailUser: jest.fn(),
      signOut: jest.fn(),
      refreshSession: jest.fn(),
    });

    const { getByTestId } = render(
      <SessionProvider>
        <UserProvider>
          <TestComponent />
        </UserProvider>
      </SessionProvider>
    );

    // 初期はローディング中
    expect(getByTestId('loading-status')).toHaveTextContent('loading');

    // ローディング完了
    await waitFor(() => {
      expect(getByTestId('loading-status')).toHaveTextContent('not-loading');
      expect(getByTestId('user-status')).toHaveTextContent('user-Test User');
    });
  });
});