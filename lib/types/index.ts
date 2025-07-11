// Supabase型定義をre-export
export * from '@/lib/types/supabase';
import type { User, Tables } from '@/lib/types/supabase';

// 基本的な型定義
export interface ApiResponse<T> {
  data: T;
  message?: string;
  error?: string;
}

// ビューモデル用の拡張型
export interface HouseholdMemberWithUser {
  id: string;
  householdId: string;
  userId: string;
  role: 'admin' | 'member';
  joinedAt: Date;
  user: Tables<'users'>;
}

export interface ChoreWithLogs {
  id: string;
  household_id: string;
  name: string;
  reward_amount: number;
  order_index: number;
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
  todayLogs: ChoreLogWithUser[];
}

export interface ChoreLogWithUser {
  id: string;
  household_id: string;
  chore_id: string | null; // 家事削除後はnullになる可能性
  performed_by: string;
  performed_at: Date;
  note?: string | null;
  user: Tables<'users'>;
  chore?: {
    name: string;
    reward_amount: number;
  };
  // 実行時の家事情報（常に表示で使用）
  chore_name?: string;
  chore_reward_amount?: number;
}

