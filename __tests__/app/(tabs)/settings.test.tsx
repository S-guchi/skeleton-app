import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react-native';
import SettingsScreen from '@/app/(app)/(tabs)/settings';

// Mock expo-router
const mockPush = jest.fn();
const mockReplace = jest.fn();

jest.mock('expo-router', () => ({
  router: {
    push: mockPush,
    replace: mockReplace,
  },
}));

// Mock session context
jest.mock('@/lib/contexts/SessionContext', () => ({
  useSession: () => ({
    session: { user: { is_anonymous: false } },
    isAuthLoading: false,
    signOut: jest.fn(),
  }),
}));

// Mock user context
jest.mock('@/lib/contexts/UserContext', () => ({
  useUser: () => ({
    user: { name: 'Test User' },
    isUserLoading: false,
  }),
}));

// Mock localization hook
jest.mock('@/lib/hooks/useLocalization', () => ({
  useLocalization: () => ({
    t: (key: string) => {
      const translations: { [key: string]: string } = {
        'settings.about': 'アプリ情報',
        'settings.support': 'サポート',
        'settings.version': 'バージョン',
        'settings.household': '世帯',
        'settings.householdSettings': '世帯設定',
        'settings.settlementDay': '精算日',
        'settings.manageMembers': 'メンバー管理',
        'members.inviteMembers': 'メンバーを招待',
        'chores.title': '家事',
        'settings.manageChores': '家事管理',
        'chores.addChore': '家事を追加',
        'settings.language': '言語',
        'settings.notifications': '通知',
        'settings.profile': 'プロフィール',
        'settings.logout': 'ログアウト',
        'common.error': 'エラー',
      };
      return translations[key] || key;
    },
    deviceTimeZone: 'Asia/Tokyo',
    deviceRegion: 'JP',
    getCurrentTimeInDeviceTimeZone: () => '2024-01-01 12:00:00',
    setLocale: jest.fn(),
    availableLocales: [
      { code: 'ja', name: '日本語' },
      { code: 'en', name: 'English' },
    ],
    currentLocale: 'ja',
  }),
}));

// Mock EmailDisplaySection
jest.mock('@/components/EmailDisplaySection', () => {
  return function MockEmailDisplaySection() {
    return null;
  };
});

describe('SettingsScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('プライバシーポリシーリンクが表示される', () => {
    render(<SettingsScreen />);
    expect(screen.getByText('プライバシーポリシー')).toBeTruthy();
    expect(screen.getByText('個人情報の取り扱いについて')).toBeTruthy();
  });

  it('プライバシーポリシーリンクをタップすると正しいページに遷移する', () => {
    render(<SettingsScreen />);
    
    const privacyPolicyButton = screen.getByText('プライバシーポリシー');
    fireEvent.press(privacyPolicyButton);
    
    expect(mockPush).toHaveBeenCalledWith('/(app)/privacy-policy');
  });

  it('利用規約リンクが表示される', () => {
    render(<SettingsScreen />);
    expect(screen.getByText('利用規約')).toBeTruthy();
    expect(screen.getByText('サービス利用条件について')).toBeTruthy();
  });

  it('利用規約リンクをタップすると正しいページに遷移する', () => {
    render(<SettingsScreen />);
    
    const termsButton = screen.getByText('利用規約');
    fireEvent.press(termsButton);
    
    expect(mockPush).toHaveBeenCalledWith('/(app)/terms-of-service');
  });

  it('アプリ情報セクションが表示される', () => {
    render(<SettingsScreen />);
    expect(screen.getByText('アプリ情報')).toBeTruthy();
  });

  it('バージョン情報が表示される', () => {
    render(<SettingsScreen />);
    expect(screen.getByText('v1.0.0')).toBeTruthy();
  });

  it('アカウント削除方法リンクが表示される', () => {
    render(<SettingsScreen />);
    expect(screen.getByText('アカウント削除方法')).toBeTruthy();
    expect(screen.getByText('アカウントの削除手順について')).toBeTruthy();
  });

  it('アカウント削除方法リンクをタップすると正しいページに遷移する', () => {
    render(<SettingsScreen />);
    
    const accountDeletionButton = screen.getByText('アカウント削除方法');
    fireEvent.press(accountDeletionButton);
    
    expect(mockPush).toHaveBeenCalledWith('/(app)/account-deletion');
  });
});