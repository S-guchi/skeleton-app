import { supabase } from '@/lib/supabase';
import { createChoreLog } from '@/lib/queries/chores';

jest.mock('@/lib/supabase', () => ({
  supabase: {
    from: jest.fn(),
  },
}));

const mockSupabase = supabase as jest.Mocked<typeof supabase>;

describe('createChoreLog', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('メモ付きで家事ログを作成できる', async () => {
    const mockInsertChain = {
      select: jest.fn().mockReturnValue({
        single: jest.fn().mockResolvedValue({
          data: {
            id: 'test-log-id',
            chore_id: 'test-chore-id',
            user_id: 'test-user-id',
            household_id: 'test-household-id',
            reward_amount: 100,
            note: 'テストメモ',
            created_at: '2023-01-01T00:00:00Z',
          },
          error: null,
        }),
      }),
    };

    const mockFrom = {
      insert: jest.fn().mockReturnValue(mockInsertChain),
    };

    mockSupabase.from.mockReturnValue(mockFrom);

    const result = await createChoreLog({
      choreId: 'test-chore-id',
      userId: 'test-user-id',
      householdId: 'test-household-id',
      rewardAmount: 100,
      note: 'テストメモ',
    });

    expect(mockSupabase.from).toHaveBeenCalledWith('chore_logs');
    expect(mockFrom.insert).toHaveBeenCalledWith({
      chore_id: 'test-chore-id',
      performed_by: 'test-user-id',
      household_id: 'test-household-id',
      reward_amount: 100,
      note: 'テストメモ',
      performed_at: expect.any(String),
    });
    expect(result).toEqual({
      id: 'test-log-id',
      chore_id: 'test-chore-id',
      user_id: 'test-user-id',
      household_id: 'test-household-id',
      reward_amount: 100,
      note: 'テストメモ',
      created_at: '2023-01-01T00:00:00Z',
    });
  });

  it('メモなしで家事ログを作成できる', async () => {
    const mockInsertChain = {
      select: jest.fn().mockReturnValue({
        single: jest.fn().mockResolvedValue({
          data: {
            id: 'test-log-id',
            chore_id: 'test-chore-id',
            user_id: 'test-user-id',
            household_id: 'test-household-id',
            reward_amount: 100,
            note: null,
            created_at: '2023-01-01T00:00:00Z',
          },
          error: null,
        }),
      }),
    };

    const mockFrom = {
      insert: jest.fn().mockReturnValue(mockInsertChain),
    };

    mockSupabase.from.mockReturnValue(mockFrom);

    const result = await createChoreLog({
      choreId: 'test-chore-id',
      userId: 'test-user-id',
      householdId: 'test-household-id',
      rewardAmount: 100,
    });

    expect(mockSupabase.from).toHaveBeenCalledWith('chore_logs');
    expect(mockFrom.insert).toHaveBeenCalledWith({
      chore_id: 'test-chore-id',
      performed_by: 'test-user-id',
      household_id: 'test-household-id',
      reward_amount: 100,
      note: undefined,
      performed_at: expect.any(String),
    });
    expect(result).toEqual({
      id: 'test-log-id',
      chore_id: 'test-chore-id',
      user_id: 'test-user-id',
      household_id: 'test-household-id',
      reward_amount: 100,
      note: null,
      created_at: '2023-01-01T00:00:00Z',
    });
  });

  it('エラーが発生した場合、適切なエラーを投げる', async () => {
    const mockInsertChain = {
      select: jest.fn().mockReturnValue({
        single: jest.fn().mockResolvedValue({
          data: null,
          error: { message: 'Insert failed' },
        }),
      }),
    };

    const mockFrom = {
      insert: jest.fn().mockReturnValue(mockInsertChain),
    };

    mockSupabase.from.mockReturnValue(mockFrom);

    await expect(
      createChoreLog({
        choreId: 'test-chore-id',
        userId: 'test-user-id',
        householdId: 'test-household-id',
        rewardAmount: 100,
        note: 'テストメモ',
      })
    ).rejects.toEqual({ message: 'Insert failed' });
  });
});