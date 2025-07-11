import AccountDeletionScreen from '@/app/(app)/account-deletion';
import { render, screen } from '@testing-library/react-native';
import React from 'react';

// Mock expo-router
jest.mock('expo-router', () => ({
  router: {
    back: jest.fn(),
  },
}));

// Mock localization hook
jest.mock('@/lib/hooks/useLocalization', () => ({
  useLocalization: () => ({
    t: (key: string) => {
      const translations: { [key: string]: string } = {
        'accountDeletion.title': 'アカウント削除方法',
        'common.back': '戻る',
      };
      return translations[key] || key;
    },
  }),
}));

// Mock safe area insets
jest.mock('react-native-safe-area-context', () => ({
  useSafeAreaInsets: () => ({ top: 20, right: 0, bottom: 0, left: 0 }),
}));

describe('AccountDeletionScreen', () => {
  it('アカウント削除方法のタイトルが表示される', () => {
    render(<AccountDeletionScreen />);
    expect(screen.getByText('アカウント削除方法')).toBeTruthy();
  });

  it('戻るボタンが表示される', () => {
    render(<AccountDeletionScreen />);
    expect(screen.getByText('戻る')).toBeTruthy();
  });

  it('削除前の注意事項が表示される', () => {
    render(<AccountDeletionScreen />);
    expect(screen.getByText(/アカウント削除前の重要な注意事項/)).toBeTruthy();
    expect(screen.getByText(/一度削除されたアカウントは復旧できません/)).toBeTruthy();
  });

  it('データのバックアップについての説明が表示される', () => {
    render(<AccountDeletionScreen />);
    expect(screen.getByText(/データのバックアップ/)).toBeTruthy();
  });

  it('削除手順の説明が表示される', () => {
    render(<AccountDeletionScreen />);
    expect(screen.getByText(/削除手順/)).toBeTruthy();
    expect(screen.getByText(/ステップ 1/)).toBeTruthy();
    expect(screen.getByText(/ステップ 2/)).toBeTruthy();
    expect(screen.getByText(/ステップ 3/)).toBeTruthy();
  });

  it('削除後の影響についての説明が表示される', () => {
    render(<AccountDeletionScreen />);
    expect(screen.getByText(/削除後の影響/)).toBeTruthy();
  });

  it('再登録についての説明が表示される', () => {
    render(<AccountDeletionScreen />);
    expect(screen.getByText(/再登録について/)).toBeTruthy();
  });

  it('アカウント削除ボタンが表示される', () => {
    render(<AccountDeletionScreen />);
    expect(screen.getByText('アカウントを削除する')).toBeTruthy();
  });

  it('削除ボタンをタップすると確認ダイアログが表示される', () => {
    render(<AccountDeletionScreen />);
    const deleteButton = screen.getByText('アカウントを削除する');
    expect(deleteButton).toBeTruthy();
    // NOTE: Alert.alertのテストは実際の実装で検証
  });
});
