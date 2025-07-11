import { View, Text, ScrollView, ActivityIndicator } from "react-native";
import { useState } from "react";
import { COLORS } from "@/lib/constants";
import { PeriodSelector } from "@/components/ranking/PeriodSelector";
import { RankingChart } from "@/components/ranking/RankingChart";
import { RankingList } from "@/components/ranking/RankingList";
import { useRankings } from "@/lib/hooks/useRanking";
import type { RankingPeriod } from "@/lib/queries/ranking";

export default function RankingScreen() {
  const [selectedPeriod, setSelectedPeriod] = useState<RankingPeriod>('month');
  const { data: rankings, isLoading, error } = useRankings(selectedPeriod);
  
  console.log('🏆 ランキング画面レンダリング:', { 
    selectedPeriod, 
    isLoading, 
    rankingsCount: rankings?.length || 0,
    error: error?.message 
  });

  if (isLoading) {
    return (
      <View className="flex-1 bg-gray-50 dark:bg-gray-900 items-center justify-center">
        <ActivityIndicator size="large" color={COLORS.PRIMARY} />
        <Text className="text-gray-600 dark:text-gray-400 mt-4">読み込み中...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View className="flex-1 bg-gray-50 dark:bg-gray-900 items-center justify-center p-5">
        <Text className="text-red-500 text-lg font-semibold mb-2">エラーが発生しました</Text>
        <Text className="text-gray-600 dark:text-gray-400 text-center mb-4">
          {error.message}
        </Text>
        <Text className="text-gray-500 dark:text-gray-400 text-sm text-center">
          アプリを再起動してお試しください
        </Text>
      </View>
    );
  }

  return (
    <ScrollView className="flex-1 bg-gray-50 dark:bg-gray-900">
      <PeriodSelector
        selectedPeriod={selectedPeriod}
        onPeriodChange={setSelectedPeriod}
      />
      
      <View className="bg-white dark:bg-gray-800 mt-3">
        <View className="px-5 pt-4 pb-2">
          <Text className="text-xl font-bold text-gray-900 dark:text-white">
            ランキング
          </Text>
          <Text className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            みんなの頑張りを見てみよう！
          </Text>
        </View>
        
        <RankingChart rankings={rankings || []} />
      </View>
      
      <RankingList rankings={rankings || []} />
    </ScrollView>
  );
}