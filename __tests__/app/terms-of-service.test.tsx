import React from 'react';
import { render, screen } from '@testing-library/react-native';
import TermsOfServiceScreen from '@/app/(app)/terms-of-service';

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
        'terms.title': '利用規約',
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

describe('TermsOfServiceScreen', () => {
  it('利用規約のタイトルが表示される', () => {
    render(<TermsOfServiceScreen />);
    expect(screen.getByText('利用規約')).toBeTruthy();
  });

  it('戻るボタンが表示される', () => {
    render(<TermsOfServiceScreen />);
    expect(screen.getByText('戻る')).toBeTruthy();
  });

  it('アプリ名が表示される', () => {
    render(<TermsOfServiceScreen />);
    expect(screen.getByText(/{{APP_NAME}}/)).toBeTruthy();
  });

  it('各条項のタイトルが表示される', () => {
    render(<TermsOfServiceScreen />);
    expect(screen.getByText('第1条（適用）')).toBeTruthy();
    expect(screen.getByText('第2条（利用登録）')).toBeTruthy();
    expect(screen.getByText('第3条（ユーザーIDおよびパスワードの管理）')).toBeTruthy();
    expect(screen.getByText('第4条（利用料金および支払方法）')).toBeTruthy();
    expect(screen.getByText('第5条（禁止事項）')).toBeTruthy();
    expect(screen.getByText('第6条（本サービスの提供の停止等）')).toBeTruthy();
    expect(screen.getByText('第7条（利用制限および登録抹消）')).toBeTruthy();
    expect(screen.getByText('第8条（退会）')).toBeTruthy();
    expect(screen.getByText('第9条（保証の否認および免責事項）')).toBeTruthy();
    expect(screen.getByText('第10条（サービス内容の変更等）')).toBeTruthy();
    expect(screen.getByText('第11条（利用規約の変更）')).toBeTruthy();
    expect(screen.getByText('第12条（個人情報の取扱い）')).toBeTruthy();
    expect(screen.getByText('第13条（通知または連絡）')).toBeTruthy();
    expect(screen.getByText('第14条（権利義務の譲渡の禁止）')).toBeTruthy();
    expect(screen.getByText('第15条（準拠法・裁判管轄）')).toBeTruthy();
    expect(screen.getByText('第16条（アプリケーション）')).toBeTruthy();
  });

  it('禁止事項のリストが表示される', () => {
    render(<TermsOfServiceScreen />);
    expect(screen.getByText(/法令・公序良俗に違反する行為/)).toBeTruthy();
    expect(screen.getByText(/犯罪に関わる行為/)).toBeTruthy();
    expect(screen.getByText(/知的財産権の侵害/)).toBeTruthy();
  });
});