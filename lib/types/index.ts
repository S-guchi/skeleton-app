// Supabase型定義をre-export
export * from '@/lib/types/supabase';
import type { User, Tables } from '@/lib/types/supabase';

// 基本的な型定義
export interface ApiResponse<T> {
  data: T;
  message?: string;
  error?: string;
}

