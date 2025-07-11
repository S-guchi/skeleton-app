英語で考えて、ターミナルは日本語で出力して

# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## プロジェクト概要

共同生活における家事の負担を可視化し、楽しく家事に参加できる仕組みを提供するReact Native + Expoアプリ。SupabaseをバックエンドとしてBaaSアーキテクチャを採用。

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
  - `api/` - Supabase APIクライアント
  - `contexts/` - React Context状態管理
  - `hooks/` - カスタムフック
  - `queries/` - React Query hooks
  - `services/` - ビジネスロジック
  - `types/` - 共通型定義
- `supabase/migrations/` - SQLマイグレーションファイル

### データモデルの概要

- **世帯 (households)** - ルームシェアグループの単位
- **家事 (chores)** - 家事項目マスター（報酬額設定可能）
- **家事記録 (chore_logs)** - 実行記録（ポイント計算の基準）
- **ランキング** - 期間別集計ビュー（日次・週次・月次・全期間）

### 認証・権限設計

- **Supabase Auth使用**: Row Level Security (RLS) 実装済み
- **段階的認証**: 匿名認証 → メールアカウントのアップグレード可能
- **責務分離**: SessionContext（認証状態） + UserContext（ユーザーデータ）
- **世帯システム**: 管理者とメンバーの権限分離、招待システム

詳細: [AUTHENTICATION.md](./docs/AUTHENTICATION.md)

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

- カスタムカラーパレット使用（うさこテーマ）
- ボトムタブナビゲーション
- 家事記録はワンタップ操作を重視
- グラフ表示にはReact Native Chart Kitを使用

## 開発時の注意点

### テスト構成

- Jest設定で`unit`と`expo`の2プロジェクト構成
- `__tests__`ディレクトリにテストファイルを配置

### 多言語対応

- `lib/locales/`に翻訳ファイル
- 日本語がデフォルト、英語対応
- マスコットキャラクター「うさこ」の語尾「うさ〜」は日本語固有

### Supabase開発

- ローカル開発時は`supabase start`でローカルインスタンス起動
- マイグレーションファイルは手動作成
- RLSポリシーの変更時は必ずテストで権限確認

### コード品質

- TypeScript strict mode有効
- ESLint (expo preset) 使用
- すべてのAPIレスポンスにZodバリデーション適用
