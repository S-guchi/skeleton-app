/**
 * 認証されたユーザーの基本情報
 * 
 * このインターfaces は認証システム全体で使用される
 * ユーザーの基本的な情報を定義します。
 * 
 * @example
 * ```typescript
 * const user: AuthUser = {
 *   id: 'user-123',
 *   name: '山田太郎',
 *   email: 'yamada@example.com',
 *   hasCompletedOnboarding: true
 * };
 * ```
 */
export interface AuthUser {
  /** ユーザーの一意識別子 */
  id: string;
  
  /** ユーザーの表示名 */
  name: string;
  
  /** プロフィール画像のURL（オプション） */
  avatar_url?: string;
  
  /** メールアドレス（認証済みの場合のみ） */
  email?: string;
  
  /** オンボーディング完了フラグ */
  hasCompletedOnboarding?: boolean;
}

/**
 * ユーザー情報の部分更新用型
 * updateUser操作で使用されます
 */
export type UserUpdate = Partial<Pick<AuthUser, 'name' | 'avatar_url' | 'hasCompletedOnboarding'>>;

/**
 * ユーザーContextで管理するデータ型
 * 
 * ユーザー関連の状態とアクションを定義します。
 * SessionContextとは独立して動作し、
 * ユーザーデータのCRUD操作を担当します。
 */
export interface UserContextType {
  /** 現在認証されているユーザーの情報 */
  user: AuthUser | null;
  
  /** ユーザー情報の読み込み状態 */
  isUserLoading: boolean;
  
  /**
   * ユーザー情報を更新する
   * @param updates 更新するユーザー情報の部分オブジェクト
   */
  updateUser: (updates: UserUpdate) => Promise<void>;
  
  /**
   * ユーザー情報を再読み込みする
   * サーバーから最新の情報を取得します
   */
  refreshUser: () => Promise<void>;
}