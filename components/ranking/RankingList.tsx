import React from 'react';
import { View, Text } from 'react-native';
import { Card } from '@/components/ui/Card';
import type { RankingItem } from '@/lib/queries/ranking';

interface RankingListProps {
  rankings: RankingItem[];
}

export const RankingList = React.memo(function RankingList({ rankings }: RankingListProps) {
  if (rankings.length <= 3) {
    return null; // トップ3はRankingChartで表示
  }

  return (
    <View className="px-5 pb-6">
      <Text className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
        その他の順位
      </Text>
      
      {rankings.slice(3).map((ranking) => (
        <Card key={ranking.userId} className="mb-3 p-4">
          <View className="flex-row items-center justify-between">
            <View className="flex-row items-center flex-1">
              <Text className="text-lg font-medium text-gray-900 dark:text-white mr-3">
                {ranking.rank}位
              </Text>
              <Text className="text-base text-gray-700 dark:text-gray-300">
                {ranking.userName}
              </Text>
            </View>
            
            <View className="items-end">
              <Text className="text-lg font-bold text-usako-primary dark:text-usako-primary-light">
                {ranking.totalPoints.toLocaleString()}pt
              </Text>
              <Text className="text-sm text-gray-500 dark:text-gray-400">
                {ranking.choreCount}回
              </Text>
            </View>
          </View>
        </Card>
      ))}
    </View>
  );
});