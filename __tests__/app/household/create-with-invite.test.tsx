import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { Alert } from 'react-native';
import CreateHouseholdWithInviteScreen from '@/app/household/create-with-invite';
import { useSession } from '@/lib/contexts/SessionContext';
import { useUser } from '@/lib/contexts/UserContext';
import { supabase } from '@/lib/supabase';
import { createInviteCode } from '@/lib/utils/inviteCodes';

// モック
jest.mock('@/lib/contexts/SessionContext');
jest.mock('@/lib/contexts/UserContext');
jest.mock('@/lib/supabase', () => ({
  supabase: {
    auth: {
      signUp: jest.fn(),
    },
    from: jest.fn(),
  },
}));
jest.mock('@/lib/utils/inviteCodes');
jest.mock('expo-router', () => ({
  router: {
    back: jest.fn(),
    replace: jest.fn(),
  },
}));
jest.mock('expo-clipboard', () => ({
  setStringAsync: jest.fn(),
}));

const mockUseSession = useSession as jest.MockedFunction<typeof useSession>;
const mockUseUser = useUser as jest.MockedFunction<typeof useUser>;
const mockSupabase = supabase as jest.Mocked<typeof supabase>;
const mockCreateInviteCode = createInviteCode as jest.MockedFunction<typeof createInviteCode>;

describe('CreateHouseholdWithInviteScreen', () => {
  const mockSignInAnonymously = jest.fn();
  const mockRefreshUser = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(Alert, 'alert').mockImplementation(jest.fn());
    
    mockUseSession.mockReturnValue({
      session: null,
      isAuthLoading: false,
      signInAnonymously: mockSignInAnonymously,
      signIn: jest.fn(),
      signUp: jest.fn(),
      upgradeToEmailUser: jest.fn(),
      signOut: jest.fn(),
      refreshSession: jest.fn(),
    });
    
    mockUseUser.mockReturnValue({
      user: null,
      isUserLoading: false,
      updateUser: jest.fn(),
      refreshUser: mockRefreshUser,
    });
  });

  it('匿名ユーザーとして世帯を作成できる', async () => {
    // 匿名ユーザーがログイン済みの状態
    mockUseSession.mockReturnValue({
      session: { user: { id: 'anon-123' } } as any,
      isAuthLoading: false,
      signInAnonymously: mockSignInAnonymously,
      signIn: jest.fn(),
      signUp: jest.fn(),
      upgradeToEmailUser: jest.fn(),
      signOut: jest.fn(),
      refreshSession: jest.fn(),
    });
    
    mockUseUser.mockReturnValue({
      user: { id: 'anon-123', name: 'Anonymous User', hasCompletedOnboarding: false, householdId: null },
      isUserLoading: false,
      updateUser: jest.fn(),
      refreshUser: mockRefreshUser,
    });

    const mockInsert = jest.fn().mockReturnValue({
      select: jest.fn().mockReturnValue({
        single: jest.fn().mockResolvedValue({
          data: { id: 'household-123', name: 'テスト家族' },
          error: null,
        }),
      }),
    });

    const mockInsertMember = jest.fn().mockResolvedValue({ error: null });
    const mockInsertChores = jest.fn().mockResolvedValue({ error: null });

    mockSupabase.from.mockImplementation((table: string) => {
      if (table === 'households') {
        return { insert: mockInsert } as any;
      } else if (table === 'household_members') {
        return { insert: mockInsertMember } as any;
      } else if (table === 'chores') {
        return { insert: mockInsertChores } as any;
      }
      return {} as any;
    });

    mockCreateInviteCode.mockResolvedValue({
      success: true,
      inviteCode: { id: 'invite-123', code: 'ABC123' } as any,
    });

    const { getByPlaceholderText, getByText } = render(<CreateHouseholdWithInviteScreen />);

    // フォームに入力
    fireEvent.changeText(getByPlaceholderText('山田太郎'), 'テストユーザー');
    fireEvent.changeText(getByPlaceholderText('山田家族'), 'テスト家族');

    // 作成ボタンをタップ
    fireEvent.press(getByText('家族グループを作成する'));

    await waitFor(() => {
      expect(mockInsert).toHaveBeenCalledWith({
        name: 'テスト家族',
        settlement_day: expect.any(Number),
      });
      expect(mockInsertMember).toHaveBeenCalled();
      expect(mockInsertChores).toHaveBeenCalled();
      expect(mockCreateInviteCode).toHaveBeenCalled();
      expect(mockRefreshUser).toHaveBeenCalled();
    });
  });

  it('匿名認証に失敗した場合エラーメッセージを表示する', async () => {
    // ユーザーがnullの状態
    mockUseSession.mockReturnValue({
      session: null,
      isAuthLoading: false,
      signInAnonymously: mockSignInAnonymously,
      signIn: jest.fn(),
      signUp: jest.fn(),
      upgradeToEmailUser: jest.fn(),
      signOut: jest.fn(),
      refreshSession: jest.fn(),
    });
    
    mockUseUser.mockReturnValue({
      user: null,
      isUserLoading: false,
      updateUser: jest.fn(),
      refreshUser: mockRefreshUser,
    });

    const { getByPlaceholderText, getByText } = render(<CreateHouseholdWithInviteScreen />);

    // フォームに入力
    fireEvent.changeText(getByPlaceholderText('山田太郎'), 'テストユーザー');
    fireEvent.changeText(getByPlaceholderText('山田家族'), 'テスト家族');

    // 作成ボタンをタップ
    fireEvent.press(getByText('家族グループを作成する'));

    await waitFor(() => {
      expect(Alert.alert).toHaveBeenCalledWith(
        'エラー',
        expect.stringContaining('ユーザー認証に失敗しました')
      );
    });
  });
});