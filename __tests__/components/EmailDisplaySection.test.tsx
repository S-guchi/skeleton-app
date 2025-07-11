import React from 'react';
import { render } from '@testing-library/react-native';
import EmailDisplaySection from '@/components/EmailDisplaySection';

// モック設定
jest.mock('@/lib/contexts/SessionContext', () => ({
  useSession: jest.fn(),
}));

jest.mock('@/lib/hooks/useLocalization', () => ({
  useLocalization: jest.fn(),
}));

const { useSession } = require('@/lib/contexts/SessionContext');
const { useLocalization } = require('@/lib/hooks/useLocalization');

describe('EmailDisplaySection', () => {
  const mockRefreshSession = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    
    useLocalization.mockReturnValue({
      t: (key: string) => key,
    });
  });

  describe('認証済みユーザーの場合', () => {
    it('メールアドレスと認証済みアイコンが表示されること', () => {
      useSession.mockReturnValue({
        session: { 
          user: { 
            email: 'test@example.com',
            email_confirmed_at: '2024-01-01T00:00:00.000Z'
          }
        },
        refreshSession: mockRefreshSession,
      });

      const { getByText, getByTestId } = render(<EmailDisplaySection />);
      
      expect(getByText('test@example.com')).toBeTruthy();
      expect(getByText('settings.emailVerified')).toBeTruthy();
      expect(getByTestId('verified-icon')).toBeTruthy();
      expect(mockRefreshSession).toHaveBeenCalled();
    });
  });

  describe('未認証ユーザーの場合', () => {
    it('メールアドレスと認証促進メッセージが表示されること', () => {
      useSession.mockReturnValue({
        session: { 
          user: { 
            email: 'test@example.com',
            email_confirmed_at: null
          }
        },
        refreshSession: mockRefreshSession,
      });

      const { getByText, getByTestId } = render(<EmailDisplaySection />);
      
      expect(getByText('test@example.com')).toBeTruthy();
      expect(getByText('settings.pleaseVerifyEmail')).toBeTruthy();
      expect(getByTestId('unverified-icon')).toBeTruthy();
      expect(mockRefreshSession).toHaveBeenCalled();
    });
  });

  describe('ユーザーがログインしていない場合', () => {
    it('何も表示されないこと', () => {
      useSession.mockReturnValue({
        session: null,
        refreshSession: mockRefreshSession,
      });

      const { queryByText } = render(<EmailDisplaySection />);
      
      expect(queryByText('test@example.com')).toBeNull();
      // ログインしていない場合はrefreshSessionは呼ばれない
      expect(mockRefreshSession).not.toHaveBeenCalled();
    });
  });

  describe('セッション更新機能', () => {
    it('マウント時にrefreshSessionが呼ばれること', () => {
      useSession.mockReturnValue({
        session: { 
          user: { 
            email: 'test@example.com',
            email_confirmed_at: null
          }
        },
        refreshSession: mockRefreshSession,
      });

      render(<EmailDisplaySection />);
      
      expect(mockRefreshSession).toHaveBeenCalledTimes(1);
    });
  });
});