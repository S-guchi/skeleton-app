export const NAV_THEME = {
  light: {
    background: "hsl(0 0% 100%)", // background
    border: "hsl(240 5.9% 90%)", // border
    card: "hsl(0 0% 100%)", // card
    notification: "hsl(0 84.2% 60.2%)", // destructive
    primary: "hsl(240 5.9% 10%)", // primary
    text: "hsl(240 10% 3.9%)", // foreground
  },
  dark: {
    background: "hsl(240 10% 3.9%)", // background
    border: "hsl(240 3.7% 15.9%)", // border
    card: "hsl(240 10% 3.9%)", // card
    notification: "hsl(0 72% 51%)", // destructive
    primary: "hsl(0 0% 98%)", // primary
    text: "hsl(0 0% 98%)", // foreground
  },
};

// うさこの家事ノートのカラーパレット
export const COLORS = {
  // メインブランドカラー
  PRIMARY: "#FF90BB",           // メインカラー
  PRIMARY_DARK: "#E671A2",      // メインカラー（濃）
  PRIMARY_LIGHT: "#FFB4CC",     // メインカラー（薄）

  // サブカラー
  SECONDARY: "#FFC1DA",         // サブカラー
  SECONDARY_LIGHT: "#FFD6E5",   // サブカラー（薄）

  // アクセントカラー
  ACCENT_1: "#F8F8E1",          // クリーム色
  ACCENT_1_DARK: "#F0F0C8",     // クリーム色（濃）
  ACCENT_2: "#8ACCD5",          // ターコイズブルー
  ACCENT_2_DARK: "#71B8C2",     // ターコイズブルー（濃）
  ACCENT_2_LIGHT: "#A3D7E0",    // ターコイズブルー（薄）

  // グレーシステム
  GRAY_100: "#F3F4F6",
  GRAY_300: "#D1D5DB",
  GRAY_400: "#9CA3AF",
  GRAY_500: "#6B7280",
  GRAY_600: "#4B5563",
  GRAY_700: "#374151",
  GRAY_800: "#1F2937",

  // ユーティリティ
  WHITE: "#FFFFFF",
  BORDER_LIGHT: "#E5E7EB",
  SUCCESS: "#8ACCD5",           // 成功表示をターコイズに変更
  ERROR: "#EF4444",
  BLUE: "#3B82F6",

  // 状態色
  DISABLED: "#E5E7EB",
} as const;

// アプリケーション定数
export const APP_CONSTANTS = {
  // デフォルト設定
  DEFAULT_SETTLEMENT_DAY: 25,
} as const;

// 新規世帯作成時の標準家事データ
export const DEFAULT_CHORES = [
  {
    name: "掃除機かけ",
    description: "リビングと寝室の掃除機がけ",
    reward_amount: 300,
    order_index: 1,
  },
  {
    name: "洗濯",
    description: "洗濯物を洗って干す",
    reward_amount: 200,
    order_index: 2,
  },
  {
    name: "食器洗い",
    description: "食事後の食器洗いと片付け",
    reward_amount: 150,
    order_index: 3,
  },
  {
    name: "ゴミ出し",
    description: "燃えるゴミ・資源ゴミの分別と回収",
    reward_amount: 100,
    order_index: 4,
  },
  {
    name: "お風呂掃除",
    description: "浴槽とバスルーム全体の掃除",
    reward_amount: 400,
    order_index: 5,
  },
  {
    name: "トイレ掃除",
    description: "トイレの清掃と消毒",
    reward_amount: 250,
    order_index: 6,
  },
  {
    name: "料理",
    description: "朝食・昼食・夕食の準備",
    reward_amount: 500,
    order_index: 7,
  },
  {
    name: "買い物",
    description: "日用品や食材の買い出し",
    reward_amount: 200,
    order_index: 8,
  },
];
