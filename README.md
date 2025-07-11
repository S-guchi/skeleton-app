
# うさこの家事ノート

## 概要

共同生活では、家事の負担が一部の人に偏りがちで、不公平感やストレスの原因になることがあります。
このアプリは、行った家事を記録し、家事ごとにあらかじめ設定した“報酬額”をもとに貢献度を可視化。ランキング機能により各メンバーの家事への取り組みを見える化し、みんなが楽しく家事に参加できる仕組みです。

積み上げ式の棒グラフで1位、2位、3位を表示することで、競争心を刺激しつつ、全員の努力を称える環境を作ります。期間選択（今日、今週、今月、先月、全期間）により、様々な時間軸での貢献度を確認できます。

### うさことは？

語尾が「うさ〜」の可愛いうさぎ。
このアプリのマスコットキャラクターです。
家事を報告したらうさこが褒めてくれます！

### 機能整理

|優先度|機能カテゴリ|主な内容|
|---|---|---|
|**★ 必須**|**メンバー管理**|同居メンバー招待／削除、権限（管理者・一般）切替|
||**家事項目マスター**|家事項目の追加・編集・並び替え／各家事の報酬額設定|
||**ワンタップ家事記録**|ボタン 1 つで完了登録・メモ欄あり／担当者の変更も可|
||**ポイント・金額集計**|個人別・家事別の累計金額をリアルタイム表示（期間フィルタ付き）|
||**ランキング機能**|積み上げ式棒グラフで家事の貢献度をランキング表示／期間選択で様々な時間軸でのランキング確認|
|**★ あると便利**|**通知（リマインダー）**|1.「今日は家事記録ゼロです」等の記録忘れ防止 2. ランキング更新の通知|
||**ダッシュボード / レポート**|円グラフ・ランキングで貢献度を可視化／月ごとの負担率推移|
||**インセンティブ設定**|報酬額をポイント制に切替 → “ごほうび”交換など（実装は後回し可）|
|**★ 拡張候補**|**多言語・通貨対応**|海外同居にも対応できるように準備だけ設計しておく|

> **ポイント**
>
> - “ワンタップで家事記録”を UX の最優先に。
> - 通知は「やってない／記録していない」状態を検知して軽く促すだけ。
> - 外部連携やバックアップ機能は今はスコープ外。まずは上記必須 5 機能＋通知が MVP です。

## 認証システム

うさこワークでは、ユーザーが気軽に始められるよう**匿名認証**から開始し、必要に応じて**メールアカウント**にアップグレードできる段階的な認証システムを採用しています。

### 認証フロー

1. **匿名ユーザー**: アプリをすぐに試用できる
2. **メールユーザー**: データの永続化とデバイス間同期が可能
3. **アップグレード**: 匿名ユーザーから簡単にメールユーザーに移行

### 技術詳細

- **SessionContext**: 認証状態の管理（ログイン・ログアウト）
- **UserContext**: ユーザー情報の管理（プロフィール・世帯情報）
- **責務分離**: 認証とユーザーデータ管理を明確に分離

詳細な認証システムの設計については、[AUTHENTICATION.md](./docs/AUTHENTICATION.md)を参照してください。

## ルーティング

**必要画面 & ルーティング**

**認証関連**

- `/dashboard`  — ホーム（今月の家事ポイント・ランキングプレビュー／「＋家事記録」ボタン）
- `/record`  — ワンタップ家事記録（モーダル or フル画面）
- `/history`  — 家事実績リスト（期間フィルタ・メモ閲覧）
- `/ranking`  — ランキング表示（積み上げ式棒グラフ・期間選択・順位表示）
- `/chores`

  - `/chores/new`  — 家事項目追加
  - `/chores/:id/edit`  — 家事項目編集（報酬額変更など）
- `/members`  — メンバー管理（招待・権限切替）
- `/settings`  — アプリ設定（言語・通知オン／オフ など）

> **ナビゲーション例**
>
> - **ボトムタブ**：Dashboard｜Record｜History｜Ranking｜Settings
> - `/record` はタブ中央の “＋” ボタンからモーダル遷移にするとUX◎
>
### テーブル定義と役割

| テーブル                   | 管理する内容                          | 主なカラム                                                                 |
| ---------------------- | ------------------------------- | --------------------------------------------------------------------- |
| **users**              | アプリを利用するユーザーの基本情報を管理            | id / email / display\_name / password\_hash / created\_at             |
| **households**         | “世帯”や“ルームシェア”など、共同生活の単位を管理      | id / name / settlement\_day / created\_at                             |
| **household\_members** | 世帯とユーザーのひも付け・メンバー権限を管理          | id / household\_id / user\_id / role / joined\_at                     |
| **chores**             | 世帯ごとの家事項目（名前・報酬額など）のマスターを管理     | id / household\_id / name / reward\_amount / order\_index             |
| **chore\_logs**        | 実際に行った家事の記録（誰が・いつ・どの家事を行ったか）を管理 | id / household\_id / chore\_id / performed\_by / performed\_at / note |
| **monthly\_rankings**   | 月次ランキングビュー（家事ログから自動集計）          | household\_id / user\_id / user\_name / month / chore\_count / total\_points |
| **weekly\_rankings**    | 週次ランキングビュー（家事ログから自動集計）          | household\_id / user\_id / user\_name / week / chore\_count / total\_points  |
| **all\_time\_rankings** | 全期間ランキングビュー（家事ログから自動集計）         | household\_id / user\_id / user\_name / chore\_count / total\_points         |

## build

```
eas build --platform ios
```

### build log

```
eas build --platform ios
The field "cli.appVersionSource" is not set, but it will be required in the future. Learn more
Resolved "production" environment for the build. Learn more
No environment variables with visibility "Plain text" and "Sensitive" found for the "production" environment on EAS.

The field "cli.appVersionSource" is not set, but it will be required in the future. Learn more
✔ Using remote iOS credentials (Expo server)

If you provide your Apple account credentials we will be able to generate all necessary build credentials and fully validate them.
This is optional, but without Apple account access you will need to provide all the missing values manually and we can only run minimal validation on them.
✔ Do you want to log in to your Apple account? … yes

› Log in to your Apple Developer account to continue
✔ Apple ID: … haraguchi.shoya@gmail.com
› Using password for haraguchi.shoya@gmail.com from your local Keychain
  Learn more
✔ Logged in, verify your Apple account to continue
Two-factor Authentication (6 digit code) is enabled for haraguchi.shoya@gmail.com. Learn more: https://support.apple.com/en-us/HT204915

✔ How do you want to validate your account? … device / sms
✔ Please enter the 6 digit code you received at +81 •••-••••-••14: … 766997
✔ Valid code
✔ Logged in and verified
› Team shoya haraguchi (97JWUTJ996)
› Provider shoya haraguchi (127151703)
✔ Bundle identifier registered com.purotoko.usakowork
✔ Synced capabilities: Enabled: Push Notifications
✔ Synced capability identifiers: No updates
✔ Fetched Apple distribution certificates
✔ Reuse this distribution certificate?
Cert ID: X54L2VL5TC, Serial number: 41D3356BFF55A71D6AC42F518C97BC1C, Team ID: 97JWUTJ996, Team name: shoya haraguchi (Individual)
    Created: 1 month ago, Updated: 1 month ago,
    Expires: Sun, 10 May 2026 01:01:46 GMT+0900
    📲 Used by: @purotoko/mobile,@purotoko/mobile … yes
Using distribution certificate with serial number 41D3356BFF55A71D6AC42F518C97BC1C
✔ Generate a new Apple Provisioning Profile? … yes
✔ Created Apple provisioning profile
✔ Created provisioning profile

Project Credentials Configuration

Project                   @purotoko/usako-work
Bundle Identifier         com.purotoko.usakowork

App Store Configuration

Distribution Certificate
Serial Number             41D3356BFF55A71D6AC42F518C97BC1C
Expiration Date           Sun, 10 May 2026 01:01:46 GMT+0900
Apple Team                97JWUTJ996 (shoya haraguchi (Individual))
Updated                   1 month ago

Provisioning Profile
Developer Portal ID       294V4374LL
Status                    active
Expiration                Sun, 10 May 2026 01:01:46 GMT+0900
Apple Team                97JWUTJ996 (shoya haraguchi (Individual))
Updated                   1 second ago

All credentials are ready to build @purotoko/usako-work (com.purotoko.usakowork)

✔ Would you like to set up Push Notifications for your project? › Yes
✔ Generate a new Apple Push Notifications service key? … yes
✔ Created Apple push key
✔ Created push key
✔ Push Key assigned to usako-work: com.purotoko.usakowork

Compressing project files and uploading to EAS Build. Learn more
✔ Compressed project files 3s (45.5 MB)
✔ Uploaded to EAS 2s
✔ Computed project fingerprint
```


### 環境構築

#### 開発

```
npx supabase link
```

usako-workを選択
!Shoya5321

```
npm run db:remote-reset
```

環境変数を登録

```
# 開発用
eas env:create --name EXPO_PUBLIC_SUPABASE_URL_DEV --value https://recrgyohfqbqjlogavej.supabase.co --scope project
eas env:create --name EXPO_PUBLIC_SUPABASE_ANON_KEY_DEV --value eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJlY3JneW9oZnFicWpsb2dhdmVqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA5Mzc1NjgsImV4cCI6MjA2NjUxMzU2OH0.boxrZwyUYlIfacxWPqMBwID_vVKU23IXSSFyVXgIJLQ --scope project

```

開発ビルド
```
eas build --profile development --platform ios
```

#### 本番

```
npx supabase link
```

usako-work-prdを選択
!Shoya36255321

```
npm run db:remote-reset
```

環境変数を登録
```
# 本番用
eas env:create --name EXPO_PUBLIC_SUPABASE_URL_PROD --value https://tpjuznkomapppqdjburz.supabase.co --scope project
eas env:create --name EXPO_PUBLIC_SUPABASE_ANON_KEY_PROD --value eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRwanV6bmtvbWFwcHBxZGpidXJ6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE3MTUwODEsImV4cCI6MjA2NzI5MTA4MX0.y5d8w-KUgx71BmRcfvzdpOcNOjMjLY0tvAipBbViJd8 --scope project

```

本番ビルド

```
npx expo install --check
```
なんかエラー出たら
```
npx expo install --check

```


```
eas build --platform ios
```

```
eas build --profile production --platform ios --clear-cache
```

提出
```
eas submit --platform ios
```

### 参考

https://zenn.dev/joo_hashi/articles/5a462e39211984
