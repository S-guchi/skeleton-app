import PrivacyPolicyScreen from '@/app/(app)/privacy-policy';
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
        'privacy.title': 'プライバシーポリシー',
        'privacy.appName': '{{APP_NAME}}',
        'privacy.personalInfo': '個人情報',
        'privacy.personalInfoDescription': '「個人情報」とは，個人情報保護法にいう「個人情報」を指すものとし，生存する個人に関する情報であって，当該情報に含まれる氏名，生年月日，住所，電話番号，連絡先その他の記述等により特定の個人を識別できる情報及び容貌，指紋，声紋にかかるデータ，及び健康保険証の保険者番号などの当該情報単体から特定の個人を識別できる情報（個人識別情報）を指します。',
        'privacy.collectionMethod': '個人情報の収集方法',
        'privacy.usagePurpose': '個人情報を収集・利用する目的',
        'privacy.thirdPartyProvision': '個人情報の第三者提供',
        'privacy.disclosure': '個人情報の開示',
        'privacy.correction': '個人情報の訂正および削除',
        'privacy.stopUsage': '個人情報の利用停止等',
        'privacy.policyChanges': 'プライバシーポリシーの変更',
        'privacy.contact': 'お問い合わせ窓口',
        'privacy.email': 'haraguchi.shoya@gmail.com',
        'common.back': '戻る',
      };
      return translations[key] || key;
    },
  }),
}));

describe('PrivacyPolicyScreen', () => {
  it('プライバシーポリシーのタイトルが表示される', () => {
    render(<PrivacyPolicyScreen />);
    expect(screen.getByText('プライバシーポリシー')).toBeTruthy();
  });

  it('アプリ名が表示される', () => {
    render(<PrivacyPolicyScreen />);
    expect(screen.getByText('{{APP_NAME}}')).toBeTruthy();
  });

  it('個人情報の定義が表示される', () => {
    render(<PrivacyPolicyScreen />);
    expect(screen.getByText('個人情報')).toBeTruthy();
    expect(screen.getByText(/「個人情報」とは，個人情報保護法にいう/)).toBeTruthy();
  });

  it('各セクションのタイトルが表示される', () => {
    render(<PrivacyPolicyScreen />);
    expect(screen.getByText('個人情報の収集方法')).toBeTruthy();
    expect(screen.getByText('個人情報を収集・利用する目的')).toBeTruthy();
    expect(screen.getByText('個人情報の第三者提供')).toBeTruthy();
    expect(screen.getByText('個人情報の開示')).toBeTruthy();
    expect(screen.getByText('個人情報の訂正および削除')).toBeTruthy();
    expect(screen.getByText('個人情報の利用停止等')).toBeTruthy();
    expect(screen.getByText('プライバシーポリシーの変更')).toBeTruthy();
    expect(screen.getByText('お問い合わせ窓口')).toBeTruthy();
  });

  it('戻るボタンが表示される', () => {
    render(<PrivacyPolicyScreen />);
    expect(screen.getByText('戻る')).toBeTruthy();
  });
});
