import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { Alert } from 'react-native';
import EmailUpgradeScreen from '@/app/(app)/email-upgrade';
import { useSession } from '@/lib/contexts/SessionContext';
import { useUser } from '@/lib/contexts/UserContext';

const mockUseSession = useSession as jest.MockedFunction<typeof useSession>;
const mockUseUser = useUser as jest.MockedFunction<typeof useUser>;

// Mock dependencies
jest.mock('expo-router', () => ({
  router: {
    back: jest.fn(),
    replace: jest.fn(),
  },
}));

jest.mock('@/lib/contexts/SessionContext', () => ({
  useSession: jest.fn(),
}));

jest.mock('@/lib/contexts/UserContext', () => ({
  useUser: jest.fn(),
}));

jest.mock('react-native-safe-area-context', () => ({
  useSafeAreaInsets: () => ({ top: 0, bottom: 0, left: 0, right: 0 }),
}));

jest.spyOn(Alert, 'alert');

describe('EmailUpgradeScreen - Loading State Management', () => {
  const mockUpgradeToEmailUser = jest.fn();
  const mockUser = { name: 'テストユーザー' };

  beforeEach(() => {
    jest.clearAllMocks();
    mockUseSession.mockReturnValue({
      session: { user: { id: 'test-user-id' } },
      isAuthLoading: false,
      upgradeToEmailUser: mockUpgradeToEmailUser,
      signIn: jest.fn(),
      signUp: jest.fn(),
      signInAnonymously: jest.fn(),
      signOut: jest.fn(),
      refreshSession: jest.fn(),
    });
    mockUseUser.mockReturnValue({
      user: mockUser,
      isUserLoading: false,
      updateUser: jest.fn(),
      refreshUser: jest.fn(),
    });
  });

  test('should properly manage loading state during email upgrade process', async () => {
    const { getByText, getByPlaceholderText, queryByText } = render(<EmailUpgradeScreen />);

    // 初期状態でローディングが表示されていないことを確認
    expect(queryByText('登録中うさ...')).toBeNull();
    expect(getByText('メールアカウント登録うさ！')).toBeTruthy();

    // フォームに入力
    fireEvent.changeText(getByPlaceholderText('example@email.com'), 'test@example.com');
    fireEvent.changeText(getByPlaceholderText('••••••••'), 'password123');

    // upgradeToEmailUserが成功するまで時間がかかる場合をシミュレート
    mockUpgradeToEmailUser.mockImplementation(() => 
      new Promise(resolve => setTimeout(resolve, 1000))
    );

    // 登録ボタンを押す
    fireEvent.press(getByText('メールアカウント登録うさ！'));

    // ボタンが押された直後にローディング状態になることを確認
    await waitFor(() => {
      expect(getByText('登録中うさ...')).toBeTruthy();
    });

    // upgradeToEmailUser関数が呼ばれたことを確認
    expect(mockUpgradeToEmailUser).toHaveBeenCalledWith(
      'test@example.com',
      'password123',
      'テストユーザー'
    );

    // 処理が完了するまで待機
    await waitFor(() => {
      expect(getByText('メールアカウント登録うさ！')).toBeTruthy();
    }, { timeout: 2000 });

    // 成功メッセージが表示されることを確認
    expect(getByText('認証メールを送信したうさ〜！メールボックスを確認してね！')).toBeTruthy();
  });

  test('should handle loading state properly when AuthContext state change is delayed', async () => {
    const { getByText, getByPlaceholderText } = render(<EmailUpgradeScreen />);

    // フォームに入力
    fireEvent.changeText(getByPlaceholderText('example@email.com'), 'test@example.com');
    fireEvent.changeText(getByPlaceholderText('••••••••'), 'password123');

    // upgradeToEmailUserが成功するが、AuthContextの状態更新が遅れるケースをシミュレート
    mockUpgradeToEmailUser.mockImplementation(async () => {
      // 通常の処理完了
      return Promise.resolve();
    });

    // 登録ボタンを押す
    fireEvent.press(getByText('メールアカウント登録うさ！'));

    // ローディング状態が適切に管理されることを確認
    await waitFor(() => {
      expect(getByText('登録中うさ...')).toBeTruthy();
    });

    // 処理完了後にローディング状態が解除されることを確認
    await waitFor(() => {
      expect(getByText('メールアカウント登録うさ！')).toBeTruthy();
    });

    // 成功アラートが表示されることを確認
    await waitFor(() => {
      expect(Alert.alert).toHaveBeenCalledWith(
        '認証メール送信完了',
        '認証メールを送信しました。\nメールボックスを確認し、認証リンクをクリックしてアカウント登録を完了してください。',
        expect.any(Array)
      );
    });
  });

  test('should handle loading state when upgrade fails', async () => {
    const { getByText, getByPlaceholderText } = render(<EmailUpgradeScreen />);

    // フォームに入力
    fireEvent.changeText(getByPlaceholderText('example@email.com'), 'test@example.com');
    fireEvent.changeText(getByPlaceholderText('••••••••'), 'password123');

    // upgradeToEmailUserが失敗するケースをシミュレート
    mockUpgradeToEmailUser.mockRejectedValue(new Error('アップグレードに失敗しました'));

    // 登録ボタンを押す
    fireEvent.press(getByText('メールアカウント登録うさ！'));

    // ローディング状態が表示されることを確認
    await waitFor(() => {
      expect(getByText('登録中うさ...')).toBeTruthy();
    });

    // エラー処理後にローディング状態が解除されることを確認
    await waitFor(() => {
      expect(getByText('メールアカウント登録うさ！')).toBeTruthy();
    });

    // エラーメッセージが表示されることを確認
    expect(getByText('あれ？アカウント昇格できないうさ。入力内容を確認してみてうさ〜。')).toBeTruthy();

    // エラーアラートが表示されることを確認
    await waitFor(() => {
      expect(Alert.alert).toHaveBeenCalledWith(
        'うさこからのお知らせ',
        'アップグレードに失敗しました'
      );
    });
  });

  test('should not get stuck in loading state due to AuthContext state management', async () => {
    const { getByText, getByPlaceholderText } = render(<EmailUpgradeScreen />);

    // フォームに入力
    fireEvent.changeText(getByPlaceholderText('example@email.com'), 'test@example.com');
    fireEvent.changeText(getByPlaceholderText('••••••••'), 'password123');

    // upgradeToEmailUserが成功する
    mockUpgradeToEmailUser.mockResolvedValue(undefined);

    // 登録ボタンを押す
    fireEvent.press(getByText('メールアカウント登録うさ！'));

    // ローディング状態が表示される
    await waitFor(() => {
      expect(getByText('登録中うさ...')).toBeTruthy();
    });

    // 処理完了後に必ずローディング状態が解除される（5秒以内）
    await waitFor(() => {
      expect(getByText('メールアカウント登録うさ！')).toBeTruthy();
    }, { timeout: 5000 });

    // この時点でローディング状態に戻らないことを確認
    await new Promise(resolve => setTimeout(resolve, 100));
    expect(getByText('メールアカウント登録うさ！')).toBeTruthy();
  });
});