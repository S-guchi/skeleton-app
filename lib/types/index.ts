// Supabase型定義をre-export
export * from '@/lib/types/supabase';
import type { User, Tables } from '@/lib/types/supabase';

// 基本的な型定義
export interface ApiResponse<T> {
  data: T;
  message?: string;
  error?: string;
}

// ビューモデル用の拡張型（household機能除去のため、関連型を削除）

// 簡素化された家事ログ型
export interface ChoreLogWithUser {
  id: string;
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

