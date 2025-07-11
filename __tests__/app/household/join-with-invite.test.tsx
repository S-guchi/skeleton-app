import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { Alert } from 'react-native';
import JoinHouseholdWithInviteScreen from '@/app/household/join-with-invite';
import { useSession } from '@/lib/contexts/SessionContext';
import { useUser } from '@/lib/contexts/UserContext';
import { supabase } from '@/lib/supabase';
import { isInviteCodeValid, markInviteCodeAsUsed } from '@/lib/utils/inviteCodes';

// モック
jest.mock('@/lib/contexts/SessionContext');
jest.mock('@/lib/contexts/UserContext');
jest.mock('@/lib/supabase', () => ({
  supabase: {
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

const mockUseSession = useSession as jest.MockedFunction<typeof useSession>;
const mockUseUser = useUser as jest.MockedFunction<typeof useUser>;
const mockSupabase = supabase as jest.Mocked<typeof supabase>;
const mockIsInviteCodeValid = isInviteCodeValid as jest.MockedFunction<typeof isInviteCodeValid>;
const mockMarkInviteCodeAsUsed = markInviteCodeAsUsed as jest.MockedFunction<typeof markInviteCodeAsUsed>;

describe('JoinHouseholdWithInviteScreen', () => {
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

  it('匿名ユーザーとして招待コードで世帯に参加できる', async () => {
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

    mockIsInviteCodeValid.mockResolvedValue({
      isValid: true,
      inviteCode: {
        id: 'invite-123',
        code: 'ABC123',
        household_id: 'household-123',
      } as any,
    });

    mockMarkInviteCodeAsUsed.mockResolvedValue({
      success: true,
    });

    const mockSelect = jest.fn().mockReturnValue({
      eq: jest.fn().mockReturnValue({
        eq: jest.fn().mockReturnValue({
          single: jest.fn().mockResolvedValue({ data: null, error: null }),
        }),
      }),
    });

    const mockInsertMember = jest.fn().mockResolvedValue({ error: null });

    const mockHouseholdSelect = jest.fn().mockReturnValue({
      eq: jest.fn().mockReturnValue({
        single: jest.fn().mockResolvedValue({
          data: { id: 'household-123', name: 'テスト家族' },
          error: null,
        }),
      }),
    });

    mockSupabase.from.mockImplementation((table: string) => {
      if (table === 'household_members') {
        return { 
          select: mockSelect,
          insert: mockInsertMember,
        } as any;
      } else if (table === 'households') {
        return { select: mockHouseholdSelect } as any;
      }
      return {} as any;
    });

    const { getByPlaceholderText, getByText } = render(<JoinHouseholdWithInviteScreen />);

    // フォームに入力
    fireEvent.changeText(getByPlaceholderText('山田花子'), 'テストユーザー');
    fireEvent.changeText(getByPlaceholderText('ABC123'), 'ABC123');

    // 参加ボタンをタップ
    fireEvent.press(getByText('家族グループに参加する'));

    await waitFor(() => {
      expect(mockIsInviteCodeValid).toHaveBeenCalledWith('ABC123');
      expect(mockMarkInviteCodeAsUsed).toHaveBeenCalledWith('invite-123', 'anon-123');
      expect(mockInsertMember).toHaveBeenCalled();
      expect(mockRefreshUser).toHaveBeenCalled();
      expect(Alert.alert).toHaveBeenCalledWith(
        '家族グループに参加しました！',
        expect.stringContaining('テスト家族'),
        expect.any(Array)
      );
    });
  });

  it('ユーザーが認証されていない場合エラーメッセージを表示する', async () => {
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

    const { getByPlaceholderText, getByText } = render(<JoinHouseholdWithInviteScreen />);

    // フォームに入力
    fireEvent.changeText(getByPlaceholderText('山田花子'), 'テストユーザー');
    fireEvent.changeText(getByPlaceholderText('ABC123'), 'ABC123');

    // 参加ボタンをタップ
    fireEvent.press(getByText('家族グループに参加する'));

    await waitFor(() => {
      expect(Alert.alert).toHaveBeenCalledWith(
        'エラー',
        expect.stringContaining('ユーザー認証に失敗しました')
      );
    });
  });

  it('無効な招待コードの場合エラーメッセージを表示する', async () => {
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

    mockIsInviteCodeValid.mockResolvedValue({
      isValid: false,
      reason: 'expired',
    });

    const { getByPlaceholderText, getByText } = render(<JoinHouseholdWithInviteScreen />);

    // フォームに入力
    fireEvent.changeText(getByPlaceholderText('山田花子'), 'テストユーザー');
    fireEvent.changeText(getByPlaceholderText('ABC123'), 'EXPIRED');

    // 参加ボタンをタップ
    fireEvent.press(getByText('家族グループに参加する'));

    await waitFor(() => {
      expect(Alert.alert).toHaveBeenCalledWith(
        'エラー',
        '招待コードの有効期限が切れています'
      );
    });
  });
});