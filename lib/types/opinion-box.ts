import { z } from 'zod';

// Zodスキーマ定義
export const opinionBoxSchema = z.object({
  title: z.string().min(1, 'タイトルを入力してください'),
  content: z.string().min(1, 'ご意見・改善点を入力してください'),
  email: z.string().email('有効なメールアドレスを入力してください').optional().or(z.literal('')),
});

// 型定義
export type OpinionBoxFormData = z.infer<typeof opinionBoxSchema>;

export interface OpinionBoxRecord {
  id: string;
  user_id: string | null;
  title: string;
  content: string;
  email?: string | null;
  created_at: string;
  updated_at: string;
}

export interface OpinionBoxInsert {
  user_id?: string | null;
  title: string;
  content: string;
  email?: string | null;
}