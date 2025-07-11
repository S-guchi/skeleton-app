import type { Session } from '@supabase/supabase-js';

/**
 * 認証セッションContextで管理するデータ型
 * 
 * 認証状態と認証関連のアクションを定義します。
 * ユーザーデータの管理はUserContextが担当し、
 * こちらは純粋に認証状態のみを管理します。
 * 
 * @example
 * ```typescript
 * const { session, isAuthLoading, signIn, signOut } = useSession();
 * 
 * if (isAuthLoading) {
 *   return <LoadingSpinner />;
 * }
 * 
 * if (!session) {
 *   return <LoginForm onLogin={signIn} />;
 * }
 * ```
 */
export interface SessionContextType {
  /** Supabaseの認証セッション */
  session: Session | null;
  
  /** 認証操作のローディング状態 */
  isAuthLoading: boolean;
  
  /**
   * メールアドレスとパスワードでログイン
   * @param email メールアドレス
   * @param password パスワード
   */
  signIn: (email: string, password: string) => Promise<void>;
  
  /**
   * 新規ユーザー登録
   * @param email メールアドレス
   * @param password パスワード
   * @param name ユーザー名
   */
  signUp: (email: string, password: string, name: string) => Promise<void>;
  
  /**
   * 匿名ユーザーとしてログイン
   * 一時的なアクセスを提供します
   */
  signInAnonymously: () => Promise<void>;
  
  /**
   * 匿名ユーザーをメールユーザーにアップグレード
   * @param email メールアドレス
   * @param password パスワード
   * @param name ユーザー名
   */
  upgradeToEmailUser: (email: string, password: string, name: string) => Promise<void>;
  
  /**
   * ログアウト
   * セッションを無効化し、関連データをクリアします
   */
  signOut: () => Promise<void>;
  
  /**
   * セッションを更新
   * トークンの有効期限切れ時などに使用します
   */
  refreshSession: () => Promise<void>;
}

/**
 * 認証エラーの型定義
 */
export interface AuthError {
  /** エラーコード */
  code: string;
  
  /** エラーメッセージ */
  message: string;
  
  /** 詳細情報（オプション） */
  details?: Record<string, unknown>;
}

/**
 * 認証状態の型定義
 */
export type AuthState = 
  | 'unauthenticated'   // 未認証
  | 'authenticated'     // 認証済み
  | 'anonymous'         // 匿名ユーザー
  | 'loading';          // 認証状態確認中