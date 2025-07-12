import {
  signInAnonymously,
  signInWithEmail,
  signUpWithEmail,
  upgradeAnonymousUser,
  signInWithGoogle,
  signOut,
  updateUserProfile,
  fetchUserWithHousehold,
  deleteAccount,
} from '@/lib/services/authService';
import { supabase } from '@/lib/supabase';

// モック
jest.mock('@/lib/supabase', () => ({
  supabase: {
    auth: {
      signInAnonymously: jest.fn(),
      signInWithPassword: jest.fn(),
      signUp: jest.fn(),
      updateUser: jest.fn(),
      signInWithOAuth: jest.fn(),
      signOut: jest.fn(),
      getUser: jest.fn(),
    },
    from: jest.fn(),
  },
}));

jest.mock('@/lib/utils/authErrorMessages', () => ({
  getAuthErrorMessage: jest.fn((error) => error?.message || 'Unknown error'),
}));

const mockSupabase = supabase as jest.Mocked<typeof supabase>;

describe('authService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // コンソールログのモック
    jest.spyOn(console, 'log').mockImplementation(jest.fn());
    jest.spyOn(console, 'error').mockImplementation(jest.fn());
    jest.spyOn(console, 'warn').mockImplementation(jest.fn());
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('signInWithEmail', () => {
    it('メールアドレスとパスワードでサインインが成功する', async () => {
      (mockSupabase.auth.signInWithPassword as jest.Mock).mockResolvedValue({
        data: { user: { id: 'test-user-id' }, session: {} },
        error: null,
      });

      await expect(signInWithEmail('test@example.com', 'password123')).resolves.not.toThrow();
      expect(mockSupabase.auth.signInWithPassword).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password123',
      });
    });

    it('サインインエラーが発生した場合、適切なエラーを投げる', async () => {
      (mockSupabase.auth.signInWithPassword as jest.Mock).mockResolvedValue({
        data: { user: null, session: null },
        error: { message: 'Invalid credentials' },
      });

      await expect(signInWithEmail('test@example.com', 'wrong-password')).rejects.toThrow('Invalid credentials');
    });
  });

  describe('signUpWithEmail', () => {
    it('メールアドレス、パスワード、名前でサインアップが成功する', async () => {
      (mockSupabase.auth.signUp as jest.Mock).mockResolvedValue({
        data: { user: { id: 'test-user-id' }, session: {} },
        error: null,
      });

      await expect(signUpWithEmail('test@example.com', 'password123', 'Test User')).resolves.not.toThrow();
      expect(mockSupabase.auth.signUp).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password123',
        options: {
          data: {
            name: 'Test User',
          },
        },
      });
    });

    it('サインアップエラーが発生した場合、適切なエラーを投げる', async () => {
      (mockSupabase.auth.signUp as jest.Mock).mockResolvedValue({
        data: { user: null, session: null },
        error: { message: 'Email already registered' },
      });

      await expect(signUpWithEmail('test@example.com', 'password123', 'Test User')).rejects.toThrow('Email already registered');
    });
  });

  describe('signInAnonymously', () => {
    it('匿名認証が成功する', async () => {
      (mockSupabase.auth.signInAnonymously as jest.Mock).mockResolvedValue({
        data: { user: { id: 'test-user-id', is_anonymous: true }, session: {} },
        error: null,
      });

      await expect(signInAnonymously()).resolves.not.toThrow();
      expect(mockSupabase.auth.signInAnonymously).toHaveBeenCalled();
    });

    it('匿名認証でエラーが発生した場合、適切なエラーを投げる', async () => {
      (mockSupabase.auth.signInAnonymously as jest.Mock).mockResolvedValue({
        data: { user: null, session: null },
        error: { message: 'Anonymous auth failed' },
      });

      await expect(signInAnonymously()).rejects.toThrow('Anonymous auth failed');
    });
  });

  describe('upgradeAnonymousUser', () => {
    it('匿名ユーザーを正常にアップグレードする', async () => {
      const mockUser = { id: 'test-user-id', is_anonymous: true };
      (mockSupabase.auth.getUser as jest.Mock).mockResolvedValue({
        data: { user: mockUser },
        error: null,
      });

      (mockSupabase.auth.updateUser as jest.Mock).mockResolvedValue({
        data: { user: mockUser },
        error: null,
      });

      mockSupabase.from.mockReturnValue({
        update: jest.fn().mockReturnValue({
          eq: jest.fn().mockResolvedValue({ error: null }),
        }),
      });

      await expect(upgradeAnonymousUser('test@example.com', 'password123', 'Test User')).resolves.not.toThrow();

      expect(mockSupabase.auth.updateUser).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password123',
      });
    });

    it('匿名ユーザーでない場合、エラーを投げる', async () => {
      const mockUser = { id: 'test-user-id', is_anonymous: false };
      (mockSupabase.auth.getUser as jest.Mock).mockResolvedValue({
        data: { user: mockUser },
        error: null,
      });

      await expect(upgradeAnonymousUser('test@example.com', 'password123', 'Test User')).rejects.toThrow('匿名ユーザーではありません');
    });

    it('ユーザーが存在しない場合、エラーを投げる', async () => {
      (mockSupabase.auth.getUser as jest.Mock).mockResolvedValue({
        data: { user: null },
        error: null,
      });

      await expect(upgradeAnonymousUser('test@example.com', 'password123', 'Test User')).rejects.toThrow('ユーザーが見つかりません');
    });
  });


  describe('signOut', () => {
    it('サインアウトが成功する', async () => {
      (mockSupabase.auth.signOut as jest.Mock).mockResolvedValue({
        error: null,
      });

      await expect(signOut()).resolves.not.toThrow();
      expect(mockSupabase.auth.signOut).toHaveBeenCalled();
    });

    it('サインアウトエラーが発生した場合、適切なエラーを投げる', async () => {
      (mockSupabase.auth.signOut as jest.Mock).mockResolvedValue({
        error: { message: 'Sign out failed' },
      });

      await expect(signOut()).rejects.toThrow('Sign out failed');
    });
  });

  describe('updateUserProfile', () => {
    it('ユーザープロファイルを正常に更新する', async () => {
      mockSupabase.from.mockReturnValue({
        update: jest.fn().mockReturnValue({
          eq: jest.fn().mockResolvedValue({ error: null }),
        }),
      });

      await expect(updateUserProfile('test-user-id', { name: 'Updated Name' })).resolves.not.toThrow();
      expect(mockSupabase.from).toHaveBeenCalledWith('users');
    });

    it('プロファイル更新エラーが発生した場合、適切なエラーを投げる', async () => {
      mockSupabase.from.mockReturnValue({
        update: jest.fn().mockReturnValue({
          eq: jest.fn().mockResolvedValue({
            error: { message: 'Update failed' },
          }),
        }),
      });

      await expect(updateUserProfile('test-user-id', { name: 'Updated Name' })).rejects.toThrow('Update failed');
    });
  });

  describe('fetchUserWithHousehold', () => {
    it('匿名ユーザーレコードが存在しない場合、自動でサインアウトを実行しない', async () => {
      mockSupabase.from.mockImplementation((table) => {
        if (table === 'users') {
          return {
            select: jest.fn().mockReturnValue({
              eq: jest.fn().mockReturnValue({
                single: jest.fn().mockResolvedValue({
                  data: null,
                  error: { code: 'PGRST116' },
                }),
              }),
            }),
          };
        }
        return {};
      });

      (mockSupabase.auth.signOut as jest.Mock).mockResolvedValue({
        error: null,
      });

      const result = await fetchUserWithHousehold('test-user-id');

      expect(result).toBeNull();
      // 自動サインアウトは呼ばれないはず
      expect(mockSupabase.auth.signOut).not.toHaveBeenCalled();
    });

    it('ユーザー情報を正常に取得する', async () => {
      const mockUserData = {
        id: 'test-user-id',
        name: 'Test User',
        avatar_url: 'https://example.com/avatar.jpg',
      };

      mockSupabase.from.mockImplementation((table) => {
        if (table === 'users') {
          return {
            select: jest.fn().mockReturnValue({
              eq: jest.fn().mockReturnValue({
                single: jest.fn().mockResolvedValue({
                  data: mockUserData,
                  error: null,
                }),
              }),
            }),
          };
        }
        return {};
      });

      const result = await fetchUserWithHousehold('test-user-id');

      expect(result).toEqual({
        id: 'test-user-id',
        name: 'Test User',
        avatar_url: 'https://example.com/avatar.jpg',
        hasCompletedOnboarding: true,
      });
    });

    it('ユーザーが存在しない場合、nullを返す（自動サインアウトは行わない）', async () => {
      mockSupabase.from.mockImplementation((table) => {
        if (table === 'users') {
          return {
            select: jest.fn().mockReturnValue({
              eq: jest.fn().mockReturnValue({
                single: jest.fn().mockResolvedValue({
                  data: null,
                  error: { code: 'PGRST116' },
                }),
              }),
            }),
          };
        }
        return {};
      });

      const result = await fetchUserWithHousehold('non-existent-user');

      expect(result).toBeNull();
      // 自動サインアウトは実行されない
      expect(mockSupabase.auth.signOut).not.toHaveBeenCalled();
    });

    it('skeleton appでは常にhasCompletedOnboardingがtrueになる', async () => {
      const mockUserData = {
        id: 'test-user-id',
        name: 'Test User',
        avatar_url: null,
      };

      mockSupabase.from.mockImplementation((table) => {
        if (table === 'users') {
          return {
            select: jest.fn().mockReturnValue({
              eq: jest.fn().mockReturnValue({
                single: jest.fn().mockResolvedValue({
                  data: mockUserData,
                  error: null,
                }),
              }),
            }),
          };
        }
        return {};
      });

      const result = await fetchUserWithHousehold('test-user-id');

      expect(result).toEqual({
        id: 'test-user-id',
        name: 'Test User',
        avatar_url: null,
        hasCompletedOnboarding: true,
      });
    });
  });

  describe('deleteAccount', () => {
    it('アカウントを正常に削除する', async () => {
      const mockUser = { id: 'test-user-id' };
      (mockSupabase.auth.getUser as jest.Mock).mockResolvedValue({
        data: { user: mockUser },
        error: null,
      });

      // ユーザーテーブルからの削除をモック
      mockSupabase.from.mockReturnValue({
        delete: jest.fn().mockReturnValue({
          eq: jest.fn().mockResolvedValue({ error: null }),
        }),
      });

      (mockSupabase.auth.signOut as jest.Mock).mockResolvedValue({
        error: null,
      });

      await expect(deleteAccount()).resolves.not.toThrow();
      expect(mockSupabase.from).toHaveBeenCalledWith('users');
      expect(mockSupabase.auth.signOut).toHaveBeenCalled();
    });

    it('ユーザーが存在しない場合、エラーを投げる', async () => {
      (mockSupabase.auth.getUser as jest.Mock).mockResolvedValue({
        data: { user: null },
        error: null,
      });

      await expect(deleteAccount()).rejects.toThrow('ユーザー情報を取得できませんでした');
    });

    it('RLSポリシーエラーの場合、適切なエラーメッセージを返す', async () => {
      const mockUser = { id: 'test-user-id' };
      (mockSupabase.auth.getUser as jest.Mock).mockResolvedValue({
        data: { user: mockUser },
        error: null,
      });

      // ユーザー削除でRLSエラー
      mockSupabase.from.mockReturnValue({
        delete: jest.fn().mockReturnValue({
          eq: jest.fn().mockResolvedValue({
            error: { code: '42501', message: 'RLS policy violation' },
          }),
        }),
      });

      await expect(deleteAccount()).rejects.toThrow('ユーザーデータの削除権限がありません。管理者にお問い合わせください。');
    });
  });
});
