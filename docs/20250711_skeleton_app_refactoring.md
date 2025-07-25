# SOW: Skeleton App リファクタリング

**作成日**: 2025年7月11日
**プロジェクト**: skeleton-app
**概要**: usako-workアプリをskeleton-appに変換するリファクタリング作業

## 作業概要

元々の「うさこの家事ノート」アプリから、汎用的なスケルトンアプリケーションへの変換作業を実施しました。このプロジェクトは、React Native + Expo + Supabaseを使用した新しいアプリケーション開発のテンプレートとして利用できます。

## 実施した作業

### 1. プロジェクト名の変更

- **package.json**: `usako-work` → `skeleton-app`
- **app.json**: アプリ名を環境変数プレースホルダーに変更
- **supabase/config.toml**: project_id を変更

### 2. うさこ関連ファイルの削除

- `/assets/images/usako/` ディレクトリ全体を削除
- `/components/ui/UsakoIcon.tsx` を削除
- `/components/dashboard/UsakoMessage.tsx` を削除
- `/lib/utils/usakoMessages.ts` を削除
- 関連するテストファイルも削除

### 3. カラーパレットのニュートラル化

- **変更前**: ピンク系の「うさこカラー」
- **変更後**: 青と紫を基調とした汎用的なカラーパレット
- 環境変数での色設定をサポート

### 4. 言語ファイルの汎用化

- **日本語 (ja.json)**: 「うさ」語尾を削除、家事→タスクに変更
- **英語 (en.json)**: chore→task、household→groupに変更
- アプリ固有の表現を汎用的な表現に置換

### 5. 各タブ画面のスケルトン化

#### ホーム画面 (index.tsx)

- 家事固有のロジックを削除
- サンプルデータを使用したダッシュボードに変更
- 統計カード、最近の活動、クイックアクションのサンプル

#### 記録画面 (record.tsx)

- React Hook Form + Zod を使用したフォームサンプル
- 家事記録ではなく汎用的な入力フォームに変更
- バリデーション機能を含む基本的なフォーム例

#### 履歴画面 (history.tsx)

- 家事履歴ではなく汎用的なリスト表示
- フィルタリング機能付きのリストサンプル
- 完了/進行中ステータスの表示

#### ランキング画面 (ranking.tsx)

- 家事ランキングではなく汎用的なランキング表示
- サンプルデータを使用したランキングリスト
- 1位、2位、3位のカラーリング

#### 設定画面 (settings.tsx)

- UsakoIcon参照を削除
- 「うさこ」関連の文字列を削除
- URLを環境変数から読み込むように変更

### 6. 環境変数テンプレートの作成

- `.env.example` ファイルを作成
- アプリ情報、カラーパレット、Supabase設定を環境変数化
- 開発者が簡単にカスタマイズできる構造

### 7. READMEの更新

- 完全に新しいREADMEを作成
- スケルトンアプリとしての使用方法を説明
- 環境変数の設定方法を詳細に記載
- プロジェクト構造とカスタマイズ方法を説明

## 環境変数による設定項目

### アプリケーション情報

- `APP_NAME`: アプリ名
- `APP_FULL_NAME`: フルアプリ名
- `APP_BUNDLE_ID`: バンドル識別子

### カラーパレット

- `EXPO_PUBLIC_PRIMARY_COLOR`: プライマリカラー
- `EXPO_PUBLIC_PRIMARY_DARK`: プライマリダークカラー
- `EXPO_PUBLIC_PRIMARY_LIGHT`: プライマリライトカラー
- `EXPO_PUBLIC_SECONDARY_COLOR`: セカンダリカラー
- `EXPO_PUBLIC_SECONDARY_LIGHT`: セカンダリライトカラー

### 外部サービス

- `EXPO_PUBLIC_SUPABASE_URL`: Supabase URL
- `EXPO_PUBLIC_SUPABASE_ANON_KEY`: Supabase匿名キー
- `EXPO_PUBLIC_ABOUT_APP_URL`: アプリ情報ページURL

## 技術的な変更点

### 削除された機能

- うさこキャラクター関連の全機能
- 家事固有のビジネスロジック
- 報酬システム
- 複雑なランキング計算
- 家事マスター管理

### 保持された機能

- 認証システム（匿名→メール認証）
- 基本的なUI構造
- 国際化対応
- Supabase統合
- テスト構造
- 状態管理パターン

### 追加された機能

- 環境変数による設定
- 汎用的なサンプルデータ
- カスタマイズ可能なカラーパレット
- 詳細なドキュメント

## 使用方法

1. `.env.example` をコピーして `.env` を作成
2. 環境変数を設定
3. `app.json` のプレースホルダーを置換
4. Supabaseプロジェクトの設定
5. 開発開始

## 今後の拡張ポイント

- カスタム認証プロバイダーの追加
- 追加のUIコンポーネント
- より多くの言語対応
- デザインテーマの拡張
- 分析機能の追加

## 成果物

- 完全にスケルトン化されたReact Native + Expoアプリ
- 環境変数による簡単なカスタマイズ機能
- 学習用のサンプルコード
- 詳細なドキュメント
- 新規開発に即利用可能なテンプレート

このリファクタリングにより、「うさこの家事ノート」から完全に独立した、汎用的なアプリケーションスケルトンが完成しました。
