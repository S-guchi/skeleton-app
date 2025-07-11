import React from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import type { RankingPeriod } from '@/lib/queries/ranking';

interface PeriodSelectorProps {
  selectedPeriod: RankingPeriod;
  onPeriodChange: (period: RankingPeriod) => void;
}

const periods: { value: RankingPeriod; label: string }[] = [
  { value: 'today', label: '今日' },
  { value: 'week', label: '今週' },
  { value: 'month', label: '今月' },
  { value: 'lastMonth', label: '先月' },
  { value: 'all', label: '全期間' },
];

export const PeriodSelector = React.memo(function PeriodSelector({ 
  selectedPeriod, 
  onPeriodChange 
}: PeriodSelectorProps) {
  return (
    <ScrollView 
      horizontal 
      showsHorizontalScrollIndicator={false}
      className="px-5 py-3 bg-white dark:bg-gray-800"
    >
      <View className="flex-row gap-2">
        {periods.map((period) => (
          <TouchableOpacity
            key={period.value}
            onPress={() => onPeriodChange(period.value)}
            className={`px-4 py-2 rounded-full ${
              selectedPeriod === period.value
                ? 'bg-usako-primary dark:bg-usako-primary-dark'
                : 'bg-gray-200 dark:bg-gray-700'
            }`}
          >
            <Text
              className={`font-medium ${
                selectedPeriod === period.value
                  ? 'text-white'
                  : 'text-gray-700 dark:text-gray-300'
              }`}
            >
              {period.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </ScrollView>
  );
});