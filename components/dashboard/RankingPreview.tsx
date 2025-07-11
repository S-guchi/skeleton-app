import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Card } from '@/components/ui/Card';
import { useTopRankings } from '@/lib/hooks/useRanking';
import { COLORS } from '@/lib/constants';

export const RankingPreview = React.memo(function RankingPreview() {
  const { data: rankings, isLoading } = useTopRankings();

  // データがない場合のダミー表示用
  const hasData = rankings && rankings.length > 0;
  const displayRankings = hasData ? rankings : [
    { userId: 'dummy1', userName: 'メンバー1', totalPoints: 150 },
    { userId: 'dummy2', userName: 'メンバー2', totalPoints: 120 },
    { userId: 'dummy3', userName: 'メンバー3', totalPoints: 90 },
  ];

  const isSingleMember = hasData && rankings.length === 1;
  const isEmptyState = !hasData;

  return (
    <Card className="mb-6 p-4">
      <View className="flex-row items-center justify-between mb-3">
        <Text className="text-lg font-semibold text-gray-900 dark:text-white">
          今月のランキング
        </Text>
        <TouchableOpacity onPress={() => router.push("/(app)/(tabs)/ranking")}>
          <Text className="text-sm text-usako-primary dark:text-usako-primary-light">
            もっと見る
          </Text>
        </TouchableOpacity>
      </View>
      
      {isEmptyState ? (
        <View>
          <View className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-4 mb-2">
            <Text className="text-center text-gray-600 dark:text-gray-400 text-sm">
              家事記録をつけてランキングを見よう！
            </Text>
          </View>
          <View className="opacity-30">
            {displayRankings.map((ranking, index) => {
              const rankIcon = 'trophy';
              const rankColor = COLORS.ACCENT_1_DARK;
              
              return (
                <View key={ranking.userId} className="flex-row items-center justify-between py-2">
                  <View className="flex-row items-center flex-1">
                    <Ionicons name={rankIcon} size={20} color={rankColor} />
                    <Text className="text-base font-medium text-gray-900 dark:text-white ml-2">
                      {index + 1}位
                    </Text>
                    <Text className="text-base text-gray-700 dark:text-gray-300 ml-3">
                      {ranking.userName}
                    </Text>
                  </View>
                  <Text className="text-base font-semibold text-usako-primary dark:text-usako-primary-light">
                    {ranking.totalPoints.toLocaleString()}pt
                  </Text>
                </View>
              );
            })}
          </View>
        </View>
      ) : isSingleMember ? (
        <View>
          <View className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-4 mb-2">
            <Text className="text-center text-gray-600 dark:text-gray-400 text-sm">
              家族を誘って家事を可視化しよう！
            </Text>
          </View>
          <View className="opacity-30">
            {displayRankings.map((ranking, index) => {
              const rankIcon = 'trophy';
              const rankColor = COLORS.ACCENT_1_DARK;
              
              return (
                <View key={ranking.userId} className="flex-row items-center justify-between py-2">
                  <View className="flex-row items-center flex-1">
                    <Ionicons name={rankIcon} size={20} color={rankColor} />
                    <Text className="text-base font-medium text-gray-900 dark:text-white ml-2">
                      {index + 1}位
                    </Text>
                    <Text className="text-base text-gray-700 dark:text-gray-300 ml-3">
                      {ranking.userName}
                    </Text>
                  </View>
                  <Text className="text-base font-semibold text-usako-primary dark:text-usako-primary-light">
                    {ranking.totalPoints.toLocaleString()}pt
                  </Text>
                </View>
              );
            })}
          </View>
        </View>
      ) : (
        displayRankings.map((ranking, index) => {
        const rankIcon = index === 0 ? 'trophy' : index === 1 ? 'medal' : 'ribbon';
        const rankColor = index === 0 ? COLORS.ACCENT_1_DARK : index === 1 ? COLORS.GRAY_400 : COLORS.PRIMARY_DARK;
        
        return (
          <View key={ranking.userId} className="flex-row items-center justify-between py-2">
            <View className="flex-row items-center flex-1">
              <Ionicons name={rankIcon} size={20} color={rankColor} />
              <Text className="text-base font-medium text-gray-900 dark:text-white ml-2">
                {index + 1}位
              </Text>
              <Text className="text-base text-gray-700 dark:text-gray-300 ml-3">
                {ranking.userName}
              </Text>
            </View>
            <Text className="text-base font-semibold text-usako-primary dark:text-usako-primary-light">
              {ranking.totalPoints.toLocaleString()}pt
            </Text>
          </View>
        );
      })
      )}
      
      <TouchableOpacity 
        onPress={() => router.push("/(app)/(tabs)/ranking")}
        className="mt-3 bg-usako-primary dark:bg-usako-primary-dark rounded-lg py-2"
      >
        <Text className="text-white text-center font-medium">
          ランキングを見る
        </Text>
      </TouchableOpacity>
    </Card>
  );
});