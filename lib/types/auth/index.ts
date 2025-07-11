/**
 * 認証システム関連の型定義
 * 
 * このモジュールは認証システム全体で使用される型定義を
 * 統一的にエクスポートします。
 * 
 * ## 使用方法
 * 
 * ```typescript
 * // 推奨: 統一エクスポートからインポート
 * import type { AuthUser, SessionContextType } from '@/lib/types/auth';
 * 
 * // 個別ファイルからのインポートも可能
 * import type { AuthUser } from '@/lib/types/auth/user';
 * import type { SessionContextType } from '@/lib/types/auth/session';
 * ```
 * 
 * ## 型の責務分離
 * 
 * - **AuthUser**: ユーザーの基本情報（ID、名前、世帯IDなど）
 * - **SessionContextType**: 認証状態とログイン/ログアウト操作
 * - **UserContextType**: ユーザーデータの管理と更新操作
 */

// ユーザー関連の型定義
export type {
  AuthUser,
  UserUpdate,
  UserContextType,
} from './user';

// セッション関連の型定義
export type {
  SessionContextType,
  AuthError,
  AuthState,
} from './session';

// 便利な型エイリアス
export type {
  AuthUser as User, // より短い名前でのエクスポート
} from './user';

// インポートした型を使用してローカル型定義
import type { SessionContextType } from './session';
import type { UserContextType } from './user';

/**
 * 認証システムの統合型
 * Context Providerなどで使用
 */
export interface AuthSystem {
  /** セッション管理 */
  session: SessionContextType;
  
  /** ユーザーデータ管理 */
  user: UserContextType;
}

/**
 * 認証関連のユーティリティ型
 */
export type AuthRequired<T> = T & {
  /** 認証が必要な操作であることを示すマーカー */
  readonly _requiresAuth: true;
};

/**
 * 匿名ユーザーでもアクセス可能な操作の型
 */
export type AnonymousAllowed<T> = T & {
  /** 匿名ユーザーでもアクセス可能であることを示すマーカー */
  readonly _allowsAnonymous: true;
};