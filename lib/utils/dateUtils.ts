import type { ChoreLogWithUser } from "@/lib/types";

/**
 * 指定した月の家事ログをフィルタリング
 */
export function filterLogsByMonth(logs: ChoreLogWithUser[], targetMonth: Date): ChoreLogWithUser[] {
  const startDate = new Date(targetMonth.getFullYear(), targetMonth.getMonth(), 1);
  // 月末の23:59:59.999まで含める
  const endDate = new Date(targetMonth.getFullYear(), targetMonth.getMonth() + 1, 0, 23, 59, 59, 999);
  
  return logs.filter(log => {
    const logDate = new Date(log.performed_at);
    return logDate >= startDate && logDate <= endDate;
  });
}

/**
 * 指定した期間の家事ログをフィルタリング
 */
export function filterLogsByDateRange(
  logs: ChoreLogWithUser[], 
  startDate: Date, 
  endDate: Date
): ChoreLogWithUser[] {
  return logs.filter(log => {
    const logDate = new Date(log.performed_at);
    return logDate >= startDate && logDate <= endDate;
  });
}

/**
 * 過去N日間の家事ログをフィルタリング
 */
export function filterLogsByDays(logs: ChoreLogWithUser[], days: number): ChoreLogWithUser[] {
  const today = new Date();
  const startDate = new Date(today);
  startDate.setDate(startDate.getDate() - days);
  
  return filterLogsByDateRange(logs, startDate, today);
}

/**
 * 時刻を相対的な文字列でフォーマット
 * 言語は別途UI言語から取得、タイムゾーンはデバイスから自動取得
 * 
 * 重要: すべての時刻計算はUTC基準で行い、表示のみローカライズする
 */
export function formatTimeAgo(dateInput: string | Date, uiLanguage?: string): string {
  const date = dateInput instanceof Date ? dateInput : new Date(dateInput);
  const now = new Date();
  
  // UTCタイムスタンプで時間差を計算
  const diffMs = now.getTime() - date.getTime();
  const diffMinutes = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  // UI言語で表示文字列を決定（タイムゾーンとは独立）
  if (uiLanguage === 'ja') {
    if (diffMinutes < 1) return "たった今";
    if (diffMinutes < 60) return `${diffMinutes}分前`;
    if (diffHours < 24) return `${diffHours}時間前`;
    if (diffDays < 7) return `${diffDays}日前`;
  } else {
    if (diffMinutes < 1) return "Just now";
    if (diffMinutes < 60) return `${diffMinutes} min ago`;
    if (diffHours < 24) return `${diffHours} hours ago`;
    if (diffDays < 7) return `${diffDays} days ago`;
  }
  
  return formatDateTimeLocalized(date);
}

/**
 * デバイスのタイムゾーンでローカライズされた日時フォーマット
 * 言語とは独立してデバイスのタイムゾーン設定を使用
 */
export function formatDateTimeLocalized(date: Date): string {
  // デバイスのタイムゾーンを自動取得して使用
  return date.toLocaleString(undefined, {
    month: 'numeric',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false
  });
}

/**
 * デバイスのタイムゾーン情報を取得
 */
export function getDeviceTimeZone(): string {
  try {
    // ブラウザ/デバイスのタイムゾーンを取得
    return Intl.DateTimeFormat().resolvedOptions().timeZone;
  } catch (error) {
    console.warn('Failed to get device timezone, falling back to UTC:', error);
    return 'UTC';
  }
}

/**
 * デバイスのリージョン情報を取得
 */
export function getDeviceRegion(): string {
  try {
    // ブラウザ/デバイスのロケール情報からリージョンを推定
    const locale = Intl.DateTimeFormat().resolvedOptions().locale;
    const regionMatch = locale.match(/-([A-Z]{2})$/);
    return regionMatch ? regionMatch[1] : 'US'; // デフォルトはUS
  } catch (error) {
    console.warn('Failed to get device region, falling back to US:', error);
    return 'US';
  }
}

/**
 * 指定されたタイムゾーンでの現在時刻を取得
 */
export function getCurrentTimeInTimeZone(timeZone: string = getDeviceTimeZone()): string {
  try {
    return new Date().toLocaleString(undefined, {
      timeZone,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  } catch (error) {
    console.warn(`Failed to get time in timezone ${timeZone}:`, error);
    return new Date().toLocaleString();
  }
}

/**
 * 主要リージョンとタイムゾーンのマッピング（フォールバック用）
 */
export const REGION_TIMEZONE_MAP: Record<string, string> = {
  'JP': 'Asia/Tokyo',
  'US': 'America/New_York',
  'GB': 'Europe/London',
  'AU': 'Australia/Sydney',
  'CA': 'America/Toronto',
  'DE': 'Europe/Berlin',
  'FR': 'Europe/Paris',
  'KR': 'Asia/Seoul',
  'CN': 'Asia/Shanghai',
  'IN': 'Asia/Kolkata',
  'SG': 'Asia/Singapore',
  'TH': 'Asia/Bangkok',
  'MY': 'Asia/Kuala_Lumpur',
  'ID': 'Asia/Jakarta',
  'PH': 'Asia/Manila',
};

/**
 * リージョンコードからタイムゾーンを取得
 */
export function getTimeZoneByRegion(regionCode?: string): string {
  if (!regionCode) return 'UTC';
  return REGION_TIMEZONE_MAP[regionCode.toUpperCase()] || 'UTC';
}