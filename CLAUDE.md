英語で考えて、ターミナルは日本語で出力して
作業終了後はSOWをdocs/に作成してください。ファイル形式はyyyymmdd_<title>.mdです。

# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## プロジェクト概要

React Native + Expo + Supabaseを使用したモバイルアプリケーション開発のためのスケルトンテンプレート。認証機能、ユーザープロファイル管理、カスタマイズ可能なUIを含み、新しいアプリ開発の基盤として利用できます。

## 開発コマンド

### 開発サーバー

```bash
npm start              # Expo開発サーバー起動
npm run ios            # iOSシミュレータで起動
npm run android        # Androidエミュレータで起動
npm run web            # Web版で起動
```

### テスト・品質管理

```bash
npm run lint           # ESLint実行
npm test               # 全テスト実行
npm run test:unit      # ユニットテストのみ実行
npm run test:watch     # テストをwatchモードで実行
npm run test:coverage  # カバレッジレポート生成
```

### データベース操作

```bash
npm run db:push        # マイグレーション適用
npm run db:pull        # スキーマ取得
npm run db:migration   # 新規マイグレーション作成
npm run db:remote-reset # リモートDBリセット（開発時のみ）
```

## アーキテクチャ

### 技術スタック

- **フレームワーク**: React Native + Expo
- **言語**: TypeScript (strict mode有効)
- **状態管理**: React Context + AsyncStorage (グローバル状態) + Tanstack React Query (サーバー状態)
- **スタイリング**: NativeWind (Tailwind CSS for React Native)
- **バックエンド**: Supabase (PostgreSQL + Auth + Storage)
- **フォーム**: React Hook Form + Zod
- **国際化**: i18n-js (日本語・英語対応)

### ディレクトリ構造のキーポイント

- `app/` - Expo Router によるファイルベースルーティング
- `components/` - 機能別に分類された再利用可能コンポーネント
- `lib/` - ビジネスロジック層
  - `contexts/` - React Context状態管理
  - `hooks/` - カスタムフック
  - `services/` - ビジネスロジック
  - `types/` - 共通型定義
  - `locales/` - 国際化翻訳ファイル
  - `utils/` - ユーティリティ関数
- `supabase/migrations/` - SQLマイグレーションファイル

### データモデルの概要

最小限のスキーマを採用：

- **auth.users** - Supabase管理の認証ユーザー
- **public.users** - 拡張ユーザープロファイル（名前、表示名、アバターURL等）
- **storage.objects** - アバター画像ストレージ

### 認証・権限設計

- **Supabase Auth使用**: Row Level Security (RLS) 実装済み
- **段階的認証**: 匿名認証 → メールアカウントのアップグレード可能
- **責務分離**: SessionContext（認証状態） + UserContext（ユーザーデータ）
- **シンプルなユーザーシステム**: 個人ユーザー管理のみ

### 状態管理パターン

- **クライアント状態**: React Context + AsyncStorage (認証、設定、UI状態など)
- **サーバー状態**: React Query (キャッシュ、同期、楽観的更新)
- **フォーム状態**: React Hook Form (バリデーションはZodスキーマ)

#### 状態管理の実装例

```typescript
// Context + AsyncStorage パターン
const LocalizationContext = createContext({
  locale: 'ja',
  setLocale: async (locale: string) => {
    await AsyncStorage.setItem('user_locale', locale);
  }
});

// SessionProvider (認証状態)
const SessionProvider = ({ children }) => {
  const [session, setSession] = useState(null);
  const [user, setUser] = useState(null);
  // ...
};
```

### UIパターン

- 環境変数によるカスタマイズ可能なカラーパレット
- ボトムタブナビゲーション（ホーム・設定の2画面構成）
- プレースホルダーテキスト（{{APP_NAME}}等）による容易なカスタマイズ

### 画面構成

現在の画面構成：
- **ホーム画面** (`app/(app)/(tabs)/index.tsx`) - メイン画面
- **設定画面** (`app/(app)/(tabs)/settings.tsx`) - アカウント設定とアプリ情報
- **認証画面** - ウェルカム、ログイン、新規登録
- **法的文書** - プライバシーポリシー、利用規約、アカウント削除

## 開発時の注意点

### アプリカスタマイズ

- プレースホルダー（`{{APP_NAME}}`、`{{APP_FULL_NAME}}`、`{{APP_BUNDLE_ID}}`）を実際の値に置き換え
- 環境変数でカラーテーマをカスタマイズ
- 必要に応じて機能を追加・削除

### テスト構成

- Jest設定で`unit`と`expo`の2プロジェクト構成
- `__tests__`ディレクトリにテストファイルを配置
- css-interop互換性問題によりいくつかのUIテストは除外済み

### 多言語対応

- `lib/locales/`に翻訳ファイル
- 日本語がデフォルト、英語対応
- 新しい言語は翻訳ファイルを追加することで対応可能

### Supabase開発

- ローカル開発時は`supabase start`でローカルインスタンス起動
- マイグレーションファイルは手動作成（consolidated schema: `20250712025711_skeleton_app_consolidated_schema.sql`）
- RLSポリシーの変更時は必ずテストで権限確認

### コード品質

- TypeScript strict mode有効
- ESLint (expo preset) 使用
- すべてのAPIレスポンスにZodバリデーション適用

### データベース構成

現在のマイグレーション：
- `20250712025711_skeleton_app_consolidated_schema.sql` - 統合スキーマファイル
- 基本のusersテーブル、トリガー、RLSポリシー、ストレージポリシーを含む
- シードデータ（`supabase/seed.sql`）で最小限のテストユーザーを提供

# important-instruction-reminders
Do what has been asked; nothing more, nothing less.
NEVER create files unless they're absolutely necessary for achieving your goal.
ALWAYS prefer editing an existing file to creating a new one.
NEVER proactively create documentation files (*.md) or README files. Only create documentation files if explicitly requested by the User.