import React from "react";
import { View, Text } from "react-native";
import { Card } from "@/components/ui/Card";
import { UsakoIcon } from "@/components/ui/UsakoIcon";
import { Avatar } from "@/components/ui/Avatar";

interface RecentActivity {
  id: string;
  user: {
    name: string;
    avatarUrl?: string;
  };
  chore?: {
    name: string;
  };
  performed_at: string | Date;
}

interface RecentActivitiesProps {
  activities: RecentActivity[];
  formatTimeAgo: (dateInput: string | Date) => string;
}

export const RecentActivities = React.memo(function RecentActivities({ activities, formatTimeAgo }: RecentActivitiesProps) {
  return (
    <Card className="mb-6 p-4">
      <Text className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
        最近の家族の活動
      </Text>
      {activities.length === 0 ? (
        <View className="items-center py-4">
          <UsakoIcon size="medium" style={{ marginBottom: 8 }} />
          <Text className="text-gray-500 dark:text-gray-400 text-center">
            まだ活動記録がありませんうさ〜
          </Text>
        </View>
      ) : (
        <View className="space-y-3">
          {activities.map((activity) => (
            <View key={activity.id} className="flex-row items-center">
              <Avatar 
                src={activity.user.avatarUrl} 
                name={activity.user.name} 
                size="sm" 
                className="mr-3"
              />
              <View className="flex-1">
                <Text className="text-sm text-gray-900 dark:text-white">
                  <Text className="font-medium">{activity.user.name}</Text>
                  <Text className="text-gray-600 dark:text-gray-400">: {activity.chore?.name}</Text>
                </Text>
                <Text className="text-xs text-gray-500 dark:text-gray-400">
                  {formatTimeAgo(activity.performed_at)}
                </Text>
              </View>
            </View>
          ))}
        </View>
      )}
    </Card>
  );
});