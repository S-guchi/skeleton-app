import React from "react";
import { View, Text } from "react-native";
import { Card } from "@/components/ui/Card";
import { useLocalization } from "@/lib/hooks/useLocalization";

interface WeeklyTrendProps {
  weeklyTrend: {date: string, count: number, points: number}[];
}

export const WeeklyTrend = React.memo<WeeklyTrendProps>(({ weeklyTrend }) => {
  const { t } = useLocalization();
  const maxPoints = Math.max(...weeklyTrend.map(day => day.points), 1);

  return (
    <Card className="mb-6 p-4">
      <Text className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
        {t('home.weeklyTrend')}
      </Text>
      <View className="flex-row items-end justify-between h-24">
        {weeklyTrend.map((day, index) => (
          <View key={index} className="items-center flex-1">
            <View 
              className="bg-usako-primary dark:bg-usako-primary-light rounded-t w-8"
              style={{ 
                height: day.points > 0 ? Math.max((day.points / maxPoints) * 80, 8) : 4 
              }}
            />
            <Text className="text-xs text-gray-600 dark:text-gray-400 mt-2">
              {day.date}
            </Text>
            <Text className="text-xs text-gray-500 dark:text-gray-500">
              {t('home.times', { count: day.count })}
            </Text>
          </View>
        ))}
      </View>
    </Card>
  );
});

WeeklyTrend.displayName = 'WeeklyTrend';