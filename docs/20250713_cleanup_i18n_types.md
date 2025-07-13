# Statement of Work: i18n型定義のクリーンアップ

## 実施日
2025年7月13日

## 概要
skeleton-appプロジェクトのi18n型定義ファイル（`lib/types/i18n.ts`）から、家事管理や世帯管理に関連する不要な翻訳キーを削除しました。

## 実施内容

### 1. 削除された翻訳キーのセクション

#### navigation セクション
- `record`: 削除（家事記録機能）

#### onboarding セクション
以下のキーを削除：
- `createHousehold`
- `joinHousehold`
- `householdName`
- `inviteCode`
- `createHouseholdSuccess`
- `joinHouseholdSuccess`
- `householdNameRequired`
- `inviteCodeRequired`
- `invalidInviteCode`

#### home セクション
以下のキーを削除：
- `householdTotal`
- `yen`
- `noChoresYet`
- `startRecording`
- `recordChore`
- `viewRanking`
- `myTotal`
- `points`
- `times`

保持したキー：
- `title`
- `welcomeBack`
- `greeting`
- `viewHistory`
- `thisMonth`
- `todayProgress`
- `weeklyProgress`
- `monthlyProgress`
- `weeklyTrend`

#### record セクション
セクション全体を削除（家事記録に関する機能）

#### history セクション
以下のキーを削除：
- `completedBy`（家事実行者表示）
- `totalAmount`（金額集計）

#### ranking セクション
以下のキーを削除：
- `points`
- `times`
- `otherRankings`
- `encouragement`

#### settings セクション
以下のキーを削除：
- `household`
- `householdSettings`
- `manageMembers`
- `manageChores`
- `settlementDay`

#### chores セクション
セクション全体を削除（家事管理機能）

#### members セクション
セクション全体を削除（メンバー管理機能）

### 2. ファイル整合性
- TypeScriptの構文は有効な状態を維持
- すべてのインターフェース定義は適切に終了
- 汎用的なスケルトンアプリに適した型定義のみを残存

## 変更後のファイル構造
- **common**: 共通UI要素（変更なし）
- **navigation**: ナビゲーション項目（recordを削除）
- **auth**: 認証関連（変更なし）
- **onboarding**: オンボーディング（基本要素のみ残存）
- **home**: ホーム画面（汎用的な要素のみ）
- **history**: 履歴表示（基本機能のみ）
- **ranking**: ランキング（基本表示のみ）
- **settings**: 設定（個人設定のみ）
- **errors**: エラーメッセージ（変更なし）
- **validation**: バリデーション（変更なし）

## 影響範囲
このi18n型定義を使用している実装ファイル（翻訳ファイルやコンポーネント）も同様にクリーンアップが必要になる可能性があります。

## 完了状態
`lib/types/i18n.ts`ファイルから家事・世帯管理に関するすべての翻訳キーを削除し、汎用的なスケルトンアプリケーションに適した型定義のみを残しました。