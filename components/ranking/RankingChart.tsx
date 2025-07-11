import React from 'react';
import { View, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '@/lib/constants';
import type { RankingItem } from '@/lib/queries/ranking';

interface RankingChartProps {
  rankings: RankingItem[];
}

export const RankingChart = React.memo(function RankingChart({ rankings }: RankingChartProps) {
  if (rankings.length === 0) {
    return (
      <View className="items-center py-8">
        <Text className="text-gray-500 dark:text-gray-400">
          まだランキングデータがありません
        </Text>
      </View>
    );
  }

  const maxPoints = Math.max(...rankings.map(r => r.totalPoints));

  return (
    <View className="px-5 py-4">
      {rankings.slice(0, 3).map((ranking, index) => {
        const barWidth = maxPoints > 0 ? (ranking.totalPoints / maxPoints) * 100 : 0;
        const rankColor = index === 0 ? COLORS.ACCENT_1_DARK : index === 1 ? COLORS.GRAY_400 : COLORS.PRIMARY_DARK;
        const rankIcon = index === 0 ? 'trophy' : index === 1 ? 'medal' : 'ribbon';
        
        return (
          <View key={ranking.userId} className="mb-6">
            <View className="flex-row items-center mb-2">
              <View className="flex-row items-center flex-1">
                <Ionicons name={rankIcon} size={24} color={rankColor} />
                <Text className="text-lg font-semibold text-gray-900 dark:text-white ml-2">
                  {index + 1}位
                </Text>
                <Text className="text-lg text-gray-700 dark:text-gray-300 ml-3">
                  {ranking.userName}
                </Text>
              </View>
              <Text className="text-lg font-bold text-usako-primary dark:text-usako-primary-light">
                {ranking.totalPoints.toLocaleString()}pt
              </Text>
            </View>
            
            <View className="relative">
              <View className="absolute inset-0 bg-gray-200 dark:bg-gray-700 rounded-full" />
              <View 
                className="h-8 rounded-full"
                style={{
                  width: `${barWidth}%`,
                  backgroundColor: index === 0 ? COLORS.ACCENT_1_DARK : index === 1 ? COLORS.GRAY_400 : COLORS.PRIMARY_DARK,
                  minWidth: 20
                }}
              />
            </View>
            
            <Text className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              {ranking.choreCount}回の家事
            </Text>
          </View>
        );
      })}
    </View>
  );
});