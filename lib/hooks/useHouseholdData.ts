import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useUser } from '@/lib/contexts/UserContext';
import type { HouseholdMemberWithUser } from '@/lib/types';

// Query keys for consistent cache management
export const householdKeys = {
  all: ['household'] as const,
  details: (householdId: string) => [...householdKeys.all, 'details', householdId] as const,
  members: (householdId: string) => [...householdKeys.all, 'members', householdId] as const,
};

/**
 * 世帯詳細情報を取得するフック
 */
export function useHouseholdDetails() {
  const { user } = useUser();
  
  return useQuery({
    queryKey: householdKeys.details(user?.householdId || ''),
    queryFn: async () => {
      if (!user?.householdId) {
        throw new Error('世帯IDが見つかりません');
      }

      const { data, error } = await supabase
        .from('households')
        .select('*')
        .eq('id', user.householdId)
        .single();

      if (error) throw error;
      return data;
    },
    enabled: !!user?.householdId,
  });
}

/**
 * 世帯メンバー一覧を取得するフック
 */
export function useHouseholdMembers() {
  const { user } = useUser();
  
  return useQuery({
    queryKey: householdKeys.members(user?.householdId || ''),
    queryFn: async (): Promise<HouseholdMemberWithUser[]> => {
      if (!user?.householdId) {
        throw new Error('世帯IDが見つかりません');
      }

      if (__DEV__) console.log('🔍 useHouseholdMembers Debug:', {
        householdId: user.householdId,
        userId: user.id
      });

      const { data, error } = await supabase
        .from('household_members')
        .select(`
          *,
          user:users(*)
        `)
        .eq('household_id', user.householdId)
        .order('joined_at');

      if (__DEV__) console.log('🔍 Raw household_members data:', { data, error });

      if (error) throw error;
      
      const result = data?.map(member => ({
        id: member.id,
        householdId: member.household_id,
        userId: member.user.id,
        role: member.role as 'admin' | 'member',
        joinedAt: new Date(member.joined_at),
        user: {
          id: member.user.id,
          name: member.user.name,
          display_name: member.user.display_name,
          avatar_url: member.user.avatar_url,
          is_provider: member.user.is_provider,
          created_at: member.user.created_at,
          updated_at: member.user.updated_at,
        },
      })) || [];
      
      if (__DEV__) console.log('🔍 Mapped household members result:', result);
      return result;
    },
    enabled: !!user?.householdId,
  });
}

/**
 * 世帯メンバーを削除するフック
 */
export function useRemoveHouseholdMember() {
  const queryClient = useQueryClient();
  const { user } = useUser();

  return useMutation({
    mutationFn: async (memberId: string) => {
      const { error } = await supabase
        .from('household_members')
        .delete()
        .eq('id', memberId);

      if (error) throw error;
    },
    onSuccess: () => {
      // メンバー一覧を再取得
      if (user?.householdId) {
        queryClient.invalidateQueries({
          queryKey: householdKeys.members(user.householdId)
        });
      }
    },
    onError: (error) => {
      console.error('メンバー削除エラー:', error);
    },
  });
}


/**
 * 現在の管理者権限をチェックするフック
 */
export function useIsAdmin(): boolean {
  const { data: members } = useHouseholdMembers();
  const { user } = useUser();
  
  const currentMember = members?.find(m => m.userId === user?.id);
  return currentMember?.role === 'admin';
}