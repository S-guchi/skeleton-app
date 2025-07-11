import { useUser } from '@/lib/contexts/UserContext';
import {
  createChore,
  createChoreLog,
  deleteChore,
  getChoreLogsWithUser,
  getChoresByHousehold,
  updateChore
} from '@/lib/queries';
import { supabase } from '@/lib/supabase';
import type { Chore, ChoreLog } from '@/lib/types/supabase';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useStoreReview } from './useStoreReview';

// Query keys for consistent cache management
export const choreKeys = {
  all: ['chores'] as const,
  list: (householdId: string) => [...choreKeys.all, 'list', householdId] as const,
  logs: (householdId: string, month?: Date) => [...choreKeys.all, 'logs', householdId, month?.toISOString()] as const,
};

/**
 * 世帯の家事一覧を取得するフック
 */
export function useChores() {
  const { user } = useUser();

  return useQuery({
    queryKey: choreKeys.list(user?.householdId || ''),
    queryFn: async (): Promise<Chore[]> => {
      if (!user?.householdId) {
        throw new Error('世帯IDが見つかりません');
      }

      try {
        return await getChoresByHousehold(user.householdId);
      } catch (error) {
        console.error('家事一覧取得エラー:', error);
        throw new Error('家事一覧の取得に失敗しました');
      }
    },
    enabled: !!user?.householdId,
  });
}

/**
 * アクティブな家事のみを取得するフック
 */
export function useActiveChores() {
  const { data: allChores = [], ...rest } = useChores();

  return {
    data: allChores.filter(chore => chore.is_active),
    ...rest,
  };
}

/**
 * 特定の家事を取得するフック
 */
export function useChore(choreId: string | undefined) {
  const { user } = useUser();

  return useQuery({
    queryKey: [...choreKeys.all, 'single', choreId] as const,
    queryFn: async (): Promise<Chore | null> => {
      if (!choreId) return null;

      const allChores = await getChoresByHousehold(user?.householdId || '');
      return allChores.find(chore => chore.id === choreId) || null;
    },
    enabled: !!choreId && !!user?.householdId,
  });
}

/**
 * 家事記録を取得するフック
 */
export function useChoreLogs(month?: Date) {
  const { user } = useUser();

  return useQuery({
    queryKey: choreKeys.logs(user?.householdId || '', month),
    queryFn: async () => {
      if (!user?.householdId) {
        throw new Error('世帯IDが見つかりません');
      }

      // 月指定がある場合、その月のデータのみ取得（日本時間基準）
      if (month) {
        const year = month.getFullYear();
        const monthIndex = month.getMonth();
        const startDate = new Date(year, monthIndex, 1, 0, 0, 0, 0);
        const endDate = new Date(year, monthIndex + 1, 0, 23, 59, 59, 999);


        return await getChoreLogsWithUser(user.householdId, startDate, endDate);
      } else {
        // 今月のデータを取得（日本時間基準）
        const now = new Date();
        const year = now.getFullYear();
        const monthIndex = now.getMonth();
        const startDate = new Date(year, monthIndex, 1, 0, 0, 0, 0);
        const endDate = new Date(year, monthIndex + 1, 0, 23, 59, 59, 999);


        return await getChoreLogsWithUser(user.householdId, startDate, endDate);
      }
    },
    enabled: !!user?.householdId,
  });
}

/**
 * 新しい家事を作成するフック
 */
export function useCreateChore() {
  const queryClient = useQueryClient();
  const { user } = useUser();

  return useMutation({
    mutationFn: async (choreData: {
      name: string;
      rewardAmount: number;
    }): Promise<Chore> => {
      if (!user?.householdId) {
        throw new Error('世帯IDが見つかりません');
      }

      return await createChore({
        householdId: user.householdId,
        name: choreData.name,
        rewardAmount: choreData.rewardAmount,
        createdBy: user.id,
      });
    },
    onSuccess: () => {
      if (user?.householdId) {
        queryClient.invalidateQueries({
          queryKey: choreKeys.list(user.householdId)
        });
      }
    },
  });
}

/**
 * 家事を更新するフック
 */
export function useUpdateChore() {
  const queryClient = useQueryClient();
  const { user } = useUser();

  return useMutation({
    mutationFn: async ({
      id,
      updates,
    }: {
      id: string;
      updates: { name?: string; rewardAmount?: number; isActive?: boolean };
    }): Promise<Chore> => {
      return await updateChore(id, updates);
    },
    onSuccess: () => {
      if (user?.householdId) {
        queryClient.invalidateQueries({
          queryKey: choreKeys.list(user.householdId)
        });
      }
    },
  });
}

/**
 * 家事を削除するフック
 */
export function useDeleteChore() {
  const queryClient = useQueryClient();
  const { user } = useUser();

  return useMutation({
    mutationFn: async (id: string): Promise<void> => {
      await deleteChore(id);
    },
    onSuccess: () => {
      if (user?.householdId) {
        queryClient.invalidateQueries({
          queryKey: choreKeys.list(user.householdId)
        });
      }
    },
  });
}

/**
 * 家事記録を作成するフック
 */
export function useCreateChoreLog() {
  const queryClient = useQueryClient();
  const { user } = useUser();
  const { incrementAndCheckReview } = useStoreReview();

  return useMutation({
    mutationFn: async (logData: {
      choreId: string;
      rewardAmount: number;
      completedAt?: Date;
      note?: string;
    }): Promise<ChoreLog> => {
      if (!user?.id) {
        throw new Error('ユーザーIDが見つかりません');
      }

      return await createChoreLog({
        householdId: user.householdId!,
        choreId: logData.choreId,
        userId: user.id,
        rewardAmount: logData.rewardAmount,
        completedAt: logData.completedAt,
        note: logData.note,
      });
    },
    onSuccess: async () => {
      if (user?.householdId) {
        // 家事ログを無効化（すべての月）
        queryClient.invalidateQueries({
          predicate: (query) => {
            const key = query.queryKey;
            return Array.isArray(key) && key[0] === 'chores' && key[1] === 'logs' && key[2] === user.householdId;
          }
        });
        // ダッシュボードデータも無効化
        queryClient.invalidateQueries({
          queryKey: ['dashboard']
        });
        // 精算データも無効化（すべての精算関連クエリ）
        queryClient.invalidateQueries({
          predicate: (query) => {
            const key = query.queryKey;
            return Array.isArray(key) && key[0] === 'settlements';
          }
        });

        // ストアレビューチェック（カウンターを1増加）
        try {
          await incrementAndCheckReview(1);
        } catch (error) {
          console.error('ストアレビューチェックエラー:', error);
        }
      }
    },
  });
}

/**
 * 複数の家事を一度に記録するフック
 */
export function useCreateMultipleChoreLogsMutation() {
  const queryClient = useQueryClient();
  const { user } = useUser();
  const { incrementAndCheckReview } = useStoreReview();

  return useMutation({
    mutationFn: async (choreData: Array<{ choreId: string; rewardAmount: number; note?: string }>): Promise<ChoreLog[]> => {
      if (!user?.id) {
        throw new Error('ユーザーIDが見つかりません');
      }

      const logs = await Promise.all(
        choreData.map(chore =>
          createChoreLog({
            householdId: user.householdId!,
            choreId: chore.choreId,
            userId: user.id,
            rewardAmount: chore.rewardAmount,
            note: chore.note,
          })
        )
      );

      return logs;
    },
    onSuccess: async (logs) => {
      if (user?.householdId) {
        // 家事ログを無効化（すべての月）
        queryClient.invalidateQueries({
          predicate: (query) => {
            const key = query.queryKey;
            return Array.isArray(key) && key[0] === 'chores' && key[1] === 'logs' && key[2] === user.householdId;
          }
        });
        // ダッシュボードデータも無効化
        queryClient.invalidateQueries({
          queryKey: ['dashboard']
        });
        // 精算データも無効化（すべての精算関連クエリ）
        queryClient.invalidateQueries({
          predicate: (query) => {
            const key = query.queryKey;
            return Array.isArray(key) && key[0] === 'settlements';
          }
        });
        // ランキングデータも無効化
        queryClient.invalidateQueries({
          predicate: (query) => {
            const key = query.queryKey;
            return Array.isArray(key) && key[0] === 'rankings' && key[1] === user.householdId;
          }
        });

        // ストアレビューチェック（カウンターを増加）
        try {
          await incrementAndCheckReview(logs.length);
        } catch (error) {
          console.error('ストアレビューチェックエラー:', error);
        }
      }
    },
  });
}

/**
 * 家事のアクティブ状態を切り替えるフック
 */
export function useToggleChoreActive() {
  const queryClient = useQueryClient();
  const { user } = useUser();

  return useMutation({
    mutationFn: async ({ id, isActive }: { id: string; isActive: boolean }): Promise<Chore> => {
      return await updateChore(id, { isActive });
    },
    onSuccess: () => {
      if (user?.householdId) {
        queryClient.invalidateQueries({
          queryKey: choreKeys.list(user.householdId)
        });
      }
    },
  });
}

/**
 * 家事ログを削除するフック
 */
export function useDeleteChoreLog() {
  const queryClient = useQueryClient();
  const { user } = useUser();

  return useMutation({
    mutationFn: async (logId: string): Promise<void> => {
      const { error } = await supabase
        .from('chore_logs')
        .delete()
        .eq('id', logId);

      if (error) {
        throw error;
      }
    },
    onSuccess: () => {
      if (user?.householdId) {
        // 家事ログを無効化（すべての月）
        queryClient.invalidateQueries({
          predicate: (query) => {
            const key = query.queryKey;
            return Array.isArray(key) && key[0] === 'chores' && key[1] === 'logs' && key[2] === user.householdId;
          }
        });
        // ダッシュボードデータも無効化
        queryClient.invalidateQueries({
          queryKey: ['dashboard']
        });
        // 精算データも無効化（すべての精算関連クエリ）
        queryClient.invalidateQueries({
          predicate: (query) => {
            const key = query.queryKey;
            return Array.isArray(key) && key[0] === 'settlements';
          }
        });
      }
    },
  });
}
