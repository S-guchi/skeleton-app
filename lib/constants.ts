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

// アプリケーションのカラーパレット
export const COLORS = {
  // メインブランドカラー（環境変数から上書き可能）
  PRIMARY: process.env.EXPO_PUBLIC_PRIMARY_COLOR || "#3B82F6",           // デフォルト：青
  PRIMARY_DARK: process.env.EXPO_PUBLIC_PRIMARY_DARK || "#2563EB",      
  PRIMARY_LIGHT: process.env.EXPO_PUBLIC_PRIMARY_LIGHT || "#60A5FA",     

  // サブカラー
  SECONDARY: process.env.EXPO_PUBLIC_SECONDARY_COLOR || "#8B5CF6",      // デフォルト：紫
  SECONDARY_LIGHT: process.env.EXPO_PUBLIC_SECONDARY_LIGHT || "#A78BFA",

  // アクセントカラー
  ACCENT_1: "#F3F4F6",          // ライトグレー
  ACCENT_1_DARK: "#E5E7EB",     
  ACCENT_2: "#10B981",          // グリーン
  ACCENT_2_DARK: "#059669",     
  ACCENT_2_LIGHT: "#34D399",    

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
  SUCCESS: "#10B981",           
  ERROR: "#EF4444",
  WARNING: "#F59E0B",
  INFO: "#3B82F6",

  // 状態色
  DISABLED: "#E5E7EB",
} as const;

// アプリケーション定数
export const APP_CONSTANTS = {
  // デフォルト設定
  DEFAULT_SETTLEMENT_DAY: 25,
} as const;
