import { RankingPreview } from "@/components/dashboard/RankingPreview";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { RecentActivities } from "@/components/dashboard/RecentActivities";
import { WeeklyTrend } from "@/components/dashboard/WeeklyTrend";
import { COLORS } from "@/lib/constants";
import { useUser } from "@/lib/contexts/UserContext";
import { useDashboard } from "@/lib/hooks/useDashboard";
import { ActivityIndicator, ScrollView, Text, View } from "react-native";

export default function DashboardScreen() {
  const { user } = useUser();
  const {
    isLoading,
    weeklyTrend,
    recentActivities,
    currentMonth,
    formatTimeAgo,
  } = useDashboard();

  if (isLoading) {
    return (
      <View className="flex-1 bg-gray-50 dark:bg-gray-900 items-center justify-center">
        <ActivityIndicator size="large" color={COLORS.BLUE} />
        <Text className="text-gray-600 dark:text-gray-400 mt-4">読み込み中...</Text>
      </View>
    );
  }

  return (
    <ScrollView className="flex-1 bg-gray-50 dark:bg-gray-900">
      <DashboardHeader userName={user?.name} currentMonth={currentMonth} />


      <View className="px-5 py-6">
        <RankingPreview />
        <WeeklyTrend weeklyTrend={weeklyTrend} />
        <RecentActivities activities={recentActivities} formatTimeAgo={formatTimeAgo} />
      </View>
    </ScrollView>
  );
}
