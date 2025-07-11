import { useCallback, useMemo } from "react";
import { useHouseholdMembers } from "./useHouseholdData";
import { useChoreLogs } from "./useChoreOperations";
import { formatTimeAgo } from "@/lib/utils/dateUtils";
import { useI18n } from "@/lib/contexts/LocalizationContext";

export function useDashboard() {
  // 現在月は固定値として扱う（将来的にpropsから受け取る想定）
  const currentMonth = useMemo(() => new Date(), []);
  const { currentLocale } = useI18n(); // UI言語のみ取得（タイムゾーンとは独立）
  const { isLoading: membersLoading } = useHouseholdMembers();
  const { data: choreLogs = [], isLoading: logsLoading } = useChoreLogs(currentMonth);
  const isLoading = membersLoading || logsLoading;

  // 最近の活動（最新5件）- 明示的にソートして取得
  const recentActivities = useMemo(() => {
    // choreLogsが既にソート済みか確認し、念のため再ソート
    const sortedLogs = [...choreLogs].sort((a, b) => 
      b.performed_at.getTime() - a.performed_at.getTime()
    );
    
    return sortedLogs
      .slice(0, 5)
      .map(log => ({
        id: log.id,
        user: {
          name: log.user?.name || "不明",
          avatarUrl: log.user?.avatarUrl,
        },
        chore: log.chore ? {
          name: log.chore.name,
        } : undefined,
        performed_at: log.performed_at,
      }));
  }, [choreLogs]);

  // 週次トレンドを計算（過去7日間）- パフォーマンス最適化
  const weeklyTrend = useMemo(() => {
    const today = new Date();
    today.setHours(23, 59, 59, 999); // 今日の終わり
    const weeklyData = [];
    
    for (let i = 6; i >= 0; i--) {
      const startOfDay = new Date(today);
      startOfDay.setDate(startOfDay.getDate() - i);
      startOfDay.setHours(0, 0, 0, 0);
      
      const endOfDay = new Date(startOfDay);
      endOfDay.setHours(23, 59, 59, 999);
      
      // Date範囲で効率的にフィルタリング
      // choreLogs.lengthが0でも、空の配列をフィルタリングして0件の結果を得る
      const dayLogs = choreLogs.filter(log => {
        const logTime = log.performed_at.getTime();
        return logTime >= startOfDay.getTime() && logTime <= endOfDay.getTime();
      });
      
      const count = dayLogs.length;
      const points = dayLogs.reduce((sum, log) => 
        sum + (log.chore?.reward_amount ?? 0), 0
      );
      
      weeklyData.push({
        date: `${startOfDay.getMonth() + 1}/${startOfDay.getDate()}`,
        count,
        points
      });
    }
    
    return weeklyData;
  }, [choreLogs]);

  // 時刻フォーマット関数（UI言語を渡し、タイムゾーンは自動取得）
  const formatTimeAgoCallback = useCallback((dateInput: string | Date) => {
    return formatTimeAgo(dateInput, currentLocale);
  }, [currentLocale]);

  return {
    isLoading,
    weeklyTrend,
    recentActivities,
    currentMonth,
    formatTimeAgo: formatTimeAgoCallback,
  };
}