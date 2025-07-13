# Skeleton App Cleanup - SOW (Statement of Work)

## 実施日
2025年7月13日

## 作業概要
React Native + Expo + Supabaseのスケルトンアプリから不要な家事管理アプリケーションのコードを削除し、真のスケルトンアプリとして整理しました。

## 背景
このプロジェクトはスケルトンアプリとして作られていましたが、家事管理アプリケーション（household chores management）の機能が残存していました。これらの機能を削除し、汎用的なスケルトンアプリとして使用できるよう整理する必要がありました。

## 実施内容

### 1. 不要なコードの特定
- "chore"および"house"キーワードで検索し、19個のファイルで関連コードを発見
- 家事管理機能に関連する以下の要素を特定：
  - 家事記録機能（chore logging）
  - 世帯管理機能（household management）  
  - メンバー管理機能（member management）
  - ランキング機能（ranking）
  - ストアレビュー促進機能（15回の家事記録後）

### 2. ルーティングの整理
**`app/(app)/_layout.tsx`**
- 削除したルート：
  - `/chores` - 家事一覧画面
  - `/chores/new` - 新規家事登録画面
  - `/members` - メンバー管理画面

### 3. 画面コンポーネントの整理  
**`app/welcome.tsx`**
- `handleJoinHousehold`関数を削除
- ログインボタンのハンドラーを直接`router.push("/sign-in")`に変更

### 4. 型定義の整理
**`lib/types/index.ts`**
- `ChoreLogWithUser`インターフェースを削除（家事ログと実行ユーザー情報）

**`lib/types/i18n.ts`**
- 削除した翻訳キーセクション：
  - `record` - 家事記録関連（全セクション）
  - `chores` - 家事管理関連（全セクション）
  - `members` - メンバー管理関連（全セクション）
- 部分的に削除した翻訳キー：
  - `navigation.record` - 記録ナビゲーション
  - `onboarding` - 世帯作成・参加関連の9キー
  - `home` - 家事・金額関連の9キー
  - `history` - completedBy、totalAmount
  - `ranking` - points、times、otherRankings、encouragement
  - `settings` - household、householdSettings、manageMembers、manageChores、settlementDay

### 5. クエリモジュールの整理
**`lib/queries/index.ts`**
- 存在しないモジュールのエクスポートを削除：
  - `./ranking`
  - `./chores`

### 6. フックの整理
**`lib/hooks/useStoreReview.ts`**
- ファイル全体を削除（家事15回記録後のストアレビュー促進機能）

### 7. サービス層の整理
**`lib/services/authService.ts`**
- `fetchUserWithHousehold`関数を`fetchUser`にリネーム
- 世帯情報の取得を削除し、ユーザー情報のみ取得するように変更

### 8. コンテキストの更新
**`lib/contexts/UserContext.tsx`**
- `fetchUserWithHousehold`のインポートと使用箇所を`fetchUser`に更新

### 9. ユーティリティ関数の整理
**`lib/utils/dateUtils.ts`**
- 削除した関数：
  - `filterLogsByMonth` - 月別家事ログフィルタ
  - `filterLogsByDateRange` - 期間別家事ログフィルタ
  - `filterLogsByDays` - 日数別家事ログフィルタ
- `ChoreLogWithUser`型のインポートを削除

### 10. エラーハンドリングの整理
**`lib/hooks/useErrorHandler.ts`**
- 削除したエラーメッセージ：
  - 'Chore not found': '家事項目が見つかりません'
  - 'Invalid chore data': '家事データが無効です'
  - 'Ranking data not found': 'ランキングデータが見つかりません'
  - 'Invalid ranking period': 'ランキング期間が無効です'

## 作業結果
- 家事管理アプリケーション固有の機能を完全に削除
- 汎用的なスケルトンアプリとして使用可能な状態に整理
- 不要なコードの削除により、プロジェクトの保守性が向上
- 新規アプリ開発時の混乱を防ぐクリーンな状態を実現

## 今後の推奨事項
1. テストファイルの更新（優先度：低）
   - 削除した機能に関連するテストケースの削除
   - 変更した関数名に対応するテストの更新
   
2. データベーススキーマの確認
   - 家事関連のテーブルやカラムが残っている可能性があるため、確認が必要
   
3. ドキュメントの更新
   - README.mdや他のドキュメントに家事管理機能への言及がある場合は更新

## 削除したファイル
- `/lib/hooks/useStoreReview.ts`

## 変更したファイル数
- 11ファイルを修正
- 1ファイルを削除
- 合計12ファイルに変更を加えた