# Skeleton App

React Native + Expo を使用したスケルトンアプリケーションテンプレート。認証機能、データ管理、カスタマイズ可能なUIコンポーネントを含んでいます。

## 機能

- 🔐 **認証機能**: Supabase Auth（匿名認証・メール認証）
- 🎨 **カスタマイズ可能なUI**: 環境変数によるカラーテーマ設定
- 📱 **マルチプラットフォーム**: iOS、Android、Web対応
- 🌍 **国際化対応**: 日本語・英語サポート
- 🗄️ **データベース**: Supabase（PostgreSQL + Row Level Security）
- 🎯 **TypeScript**: 厳密モードでの完全TypeScriptサポート
- 🧪 **テスト**: Jest + React Native Testing Library
- 🎭 **状態管理**: React Context + AsyncStorage + React Query
- 🎨 **スタイリング**: NativeWind（React Native用Tailwind CSS）

## 技術スタック

- **フレームワーク**: React Native + Expo
- **言語**: TypeScript
- **バックエンド**: Supabase（PostgreSQL + Auth + Storage）
- **状態管理**: React Context + AsyncStorage（グローバル状態） + Tanstack React Query（サーバー状態）
- **スタイリング**: NativeWind（React Native用Tailwind CSS）
- **フォーム**: React Hook Form + Zod
- **テスト**: Jest + React Native Testing Library
- **ナビゲーション**: Expo Router（ファイルベースルーティング）

## セットアップ

### 1. クローンとインストール

```bash
git clone <repository-url>
cd skeleton-app
npm install
```

### 2. 環境設定

環境変数テンプレートをコピーして設定：

```bash
cp .env.example .env
```

`.env`ファイルを編集：

```env
# アプリケーション情報
APP_NAME=あなたのアプリ名
APP_FULL_NAME=アプリの正式名称
APP_BUNDLE_ID=com.yourcompany.yourapp

# カラースキーム
EXPO_PUBLIC_PRIMARY_COLOR=#3B82F6
EXPO_PUBLIC_PRIMARY_DARK=#2563EB
EXPO_PUBLIC_PRIMARY_LIGHT=#60A5FA
EXPO_PUBLIC_SECONDARY_COLOR=#8B5CF6
EXPO_PUBLIC_SECONDARY_LIGHT=#A78BFA

# Supabase設定
EXPO_PUBLIC_SUPABASE_URL=your-supabase-url
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
```

### 3. アプリ設定の更新

`app.json`のプレースホルダーを実際の値に置き換え：

```json
{
  "expo": {
    "name": "{{APP_NAME}}",
    "slug": "skeleton-app",
    "bundleIdentifier": "{{APP_BUNDLE_ID}}",
    "extra": {
      "fullAppName": "{{APP_FULL_NAME}}"
    }
  }
}
```

### 4. データベースセットアップ

Supabaseデータベースの設定：

```bash
# ローカルSupabaseの起動（オプション）
npx supabase start

# データベーススキーマの適用
npm run db:push
```

### 5. 開発開始

```bash
# 開発サーバーの起動
npm start

# プラットフォーム別実行
npm run ios
npm run android
npm run web
```

## プロジェクト構造

```
skeleton-app/
├── app/                    # Expo Router ページ
│   ├── (app)/             # 認証済みルート
│   │   ├── (tabs)/        # メインタブナビゲーション
│   │   │   ├── index.tsx  # ホーム画面
│   │   │   └── settings.tsx# 設定画面
│   │   ├── privacy-policy.tsx    # プライバシーポリシー
│   │   ├── terms-of-service.tsx  # 利用規約
│   │   ├── account-deletion.tsx  # アカウント削除
│   │   ├── email-upgrade.tsx     # メール認証アップグレード
│   │   └── notification-settings.tsx # 通知設定
│   ├── sign-in.tsx        # ログイン
│   ├── sign-up.tsx        # 新規登録
│   └── welcome.tsx        # ウェルカム画面
├── components/            # 再利用可能なUIコンポーネント
│   ├── ui/               # 基本UIコンポーネント
│   └── ...               # 機能別コンポーネント
├── lib/                  # ビジネスロジック
│   ├── contexts/         # React Contextプロバイダー
│   ├── hooks/            # カスタムフック
│   ├── locales/          # 国際化翻訳ファイル
│   ├── services/         # ビジネスロジックサービス
│   ├── types/            # TypeScript型定義
│   └── utils/            # ユーティリティ関数
├── supabase/             # データベースマイグレーションと設定
│   ├── migrations/       # マイグレーションファイル
│   └── seed.sql          # シードデータ
└── assets/               # 静的アセット
```

## カスタマイズ

### カラーテーマ

環境変数でアプリのカラースキームをカスタマイズ：

```env
EXPO_PUBLIC_PRIMARY_COLOR=#your-primary-color
EXPO_PUBLIC_PRIMARY_DARK=#your-primary-dark
EXPO_PUBLIC_PRIMARY_LIGHT=#your-primary-light
EXPO_PUBLIC_SECONDARY_COLOR=#your-secondary-color
EXPO_PUBLIC_SECONDARY_LIGHT=#your-secondary-light
```

### アプリ情報

アプリケーション情報の更新：

```env
APP_NAME=あなたのアプリ名
APP_FULL_NAME=アプリの正式名称
APP_BUNDLE_ID=com.yourcompany.yourapp
```

### 国際化

- `lib/locales/ja.json` - 日本語翻訳を編集
- `lib/locales/en.json` - 英語翻訳を編集
- 必要に応じて言語ファイルを追加

## 利用可能なスクリプト

```bash
# 開発
npm start              # Expo開発サーバー起動
npm run ios            # iOSシミュレータで実行
npm run android        # Androidエミュレータで実行
npm run web            # Webブラウザで実行

# テスト・品質管理
npm run lint           # ESLint実行
npm test               # 全テスト実行
npm run test:unit      # ユニットテストのみ実行
npm run test:watch     # ウォッチモードでテスト実行
npm run test:coverage  # カバレッジレポート生成

# データベース
npm run db:push        # マイグレーション適用
npm run db:pull        # スキーマ変更取得
npm run db:migration   # 新しいマイグレーション作成
npm run db:remote-reset # リモートデータベースリセット（開発時のみ）
```

## 画面構成

このスケルトンアプリには以下の画面が含まれています：

1. **ホーム画面**: アプリのメイン画面
2. **設定画面**: アプリ設定とユーザー設定
3. **認証画面**: ログイン・新規登録・ウェルカム画面
4. **法的文書**: プライバシーポリシー・利用規約
5. **アカウント管理**: メールアップグレード・アカウント削除

## 認証フロー

- **匿名認証**: ユーザーはすぐにアプリを使い始められます
- **メールアップグレード**: 匿名ユーザーはメールアカウントにアップグレード可能
- **セッション管理**: SessionContextとUserContextで管理

## データベーススキーマ

スケルトンには以下の基本テーブルが含まれています：

- **auth.users**: Supabase認証ユーザー
- **public.users**: 拡張ユーザープロファイル
- **storage.objects**: アバター画像ストレージ

## テスト

テストの実行：

```bash
npm test              # 全テスト実行
npm run test:unit     # ユニットテストのみ
npm run test:watch    # ウォッチモード
npm run test:coverage # カバレッジ付き
```

## デプロイ

### プロダクションビルド

```bash
# プラットフォーム別ビルド
eas build --platform ios
eas build --platform android
eas build --platform web
```

### 環境変数

デプロイメントプラットフォームで必要な環境変数を全て設定してください。

## プレースホルダーの置き換え

アプリをカスタマイズする際は、以下のプレースホルダーを置き換えてください：

- `{{APP_NAME}}` - アプリ名
- `{{APP_FULL_NAME}}` - アプリの正式名称
- `{{APP_BUNDLE_ID}}` - バンドルID

これらのプレースホルダーは以下のファイルに含まれています：
- `app.json`
- `app/(app)/terms-of-service.tsx`
- `app/(app)/privacy-policy.tsx`
- `app/(app)/account-deletion.tsx`

## 貢献

1. リポジトリをフォーク
2. フィーチャーブランチを作成（`git checkout -b feature/amazing-feature`）
3. 変更をコミット（`git commit -m 'Add some amazing feature'`）
4. ブランチにプッシュ（`git push origin feature/amazing-feature`）
5. プルリクエストを作成

## ライセンス

このプロジェクトはMITライセンスの下で公開されています。詳細はLICENSEファイルをご覧ください。

## サポート

サポートやご質問については、GitHubリポジトリでIssueを作成してください。