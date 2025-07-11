# 認証システム型定義

認証システムで使用される型定義について説明します。

## 📁 ディレクトリ構造

```
lib/types/auth/
├── index.ts          # 統一エクスポート
├── user.ts           # ユーザー関連型定義
├── session.ts        # セッション関連型定義
└── README.md         # このファイル
```

## 🎯 型定義の責務分離

### AuthUser - ユーザー基本情報
```typescript
interface AuthUser {
  id: string;                           // ユーザーID
  name: string;                         // 表示名
  avatar?: string;                      // プロフィール画像URL
  email?: string;                       // メールアドレス
  hasCompletedOnboarding?: boolean;     // オンボーディング完了フラグ
  householdId?: string | null;          // 所属世帯ID
}
```

### SessionContextType - 認証状態管理
```typescript
interface SessionContextType {
  session: Session | null;              // Supabaseセッション
  isAuthLoading: boolean;               // 認証処理中フラグ
  signIn: (email, password) => Promise<void>;
  signOut: () => Promise<void>;
  // その他認証操作...
}
```

### UserContextType - ユーザーデータ管理
```typescript
interface UserContextType {
  user: AuthUser | null;                // ユーザー情報
  isUserLoading: boolean;               // ユーザー情報読み込み中フラグ
  updateUser: (updates) => Promise<void>;
  refreshUser: () => Promise<void>;
}
```

## 🔗 使用方法

### 推奨インポート方法

```typescript
// ✅ 推奨: 統一エクスポートから
import type { AuthUser, SessionContextType } from '@/lib/types/auth';

// ✅ 個別ファイルからも可能
import type { AuthUser } from '@/lib/types/auth/user';
import type { SessionContextType } from '@/lib/types/auth/session';

// ❌ 非推奨: 旧パス
import type { User } from '@/lib/types/user';
```

### Context での使用例

```typescript
// SessionContext
import { useSession } from '@/lib/contexts/SessionContext';
import type { SessionContextType } from '@/lib/types/auth';

const MyComponent = () => {
  const { session, isAuthLoading, signIn }: SessionContextType = useSession();
  
  if (isAuthLoading) return <Loading />;
  if (!session) return <LoginForm onLogin={signIn} />;
  
  return <AuthenticatedContent />;
};
```

```typescript
// UserContext
import { useUser } from '@/lib/contexts/UserContext';
import type { AuthUser, UserContextType } from '@/lib/types/auth';

const UserProfile = () => {
  const { user, isUserLoading, updateUser }: UserContextType = useUser();
  
  const handleUpdate = (name: string) => {
    updateUser({ name });
  };
  
  return <ProfileForm user={user} onUpdate={handleUpdate} />;
};
```

## 🔄 型エイリアス

短縮形の型エイリアスを提供しています：

```typescript
// 短縮形での使用も可能
import type { User } from '@/lib/types/auth';     // = AuthUser
```

## 📚 ベストプラクティス

### 1. 型の選択
- **AuthUser**: 認証されたユーザーの基本情報
- **UserUpdate**: ユーザー情報の部分更新
- **SessionContextType**: 認証状態とアクション
- **UserContextType**: ユーザーデータとアクション

### 2. 命名規則
- `AuthUser`: 認証済みユーザー（推奨）
- `User`: 短縮形（エクスポートのみ）

### 3. インポート規則
```typescript
// ✅ 統一エクスポートを使用
import type { AuthUser, SessionContextType } from '@/lib/types/auth';

// ✅ 複数の型を使用する場合
import type { 
  AuthUser, 
  UserUpdate, 
  SessionContextType 
} from '@/lib/types/auth';
```

### 4. TSDoc の活用
型定義にはTSDocコメントが含まれています：

```typescript
/**
 * 認証されたユーザーの基本情報
 * 
 * @example
 * ```typescript
 * const user: AuthUser = {
 *   id: 'user-123',
 *   name: '山田太郎'
 * };
 * ```
 */
interface AuthUser {
  /** ユーザーの一意識別子 */
  id: string;
  // ...
}
```

## 🚀 今後の拡張

新しい認証機能を追加する際は以下の手順で進めてください：

1. **型定義の追加**: 適切なファイル（user.ts / session.ts）に追加
2. **index.ts の更新**: 新しい型のエクスポート追加
3. **テストの追加**: `__tests__/lib/types/auth-types.test.ts` に追加
4. **ドキュメント更新**: このREADMEの更新

これにより、一貫性のある保守性の高い型定義を維持できます。