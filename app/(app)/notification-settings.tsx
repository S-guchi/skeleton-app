import { Card } from "@/components/ui/Card";
import { TimePicker } from "@/components/ui/TimePicker";
import { useNotificationStore } from "@/lib/contexts/NotificationContext";
import { cancelAllNotifications, registerForPushNotificationsAsync, scheduleDailyReminder, cancelDailyReminder } from "@/lib/utils/notifications";
import { Ionicons } from "@expo/vector-icons";
import { useEffect, useState } from "react";
import { Alert, Image, ScrollView, Switch, Text, View } from "react-native";

export default function NotificationSettingsScreen() {
  const [isLoadingPermission, setIsLoadingPermission] = useState(false);

  const {
    isNotificationEnabled,
    dailyReminder,
    dailyReminderTime,
    // memberActivity,
    setNotificationEnabled,
    setDailyReminder,
    setDailyReminderTime,
    // setMemberActivity,
  } = useNotificationStore();

  // 通知権限を要求して有効化
  const handleEnableNotifications = async () => {
    setIsLoadingPermission(true);
    try {
      const token = await registerForPushNotificationsAsync();
      if (token) {
        setNotificationEnabled(true);
        Alert.alert(
          "成功",
          "通知が有効になりました！うさ〜"
        );
      } else {
        Alert.alert(
          "エラー",
          "通知の許可が得られませんでした。設定アプリから通知を許可してください。"
        );
      }
    } catch (error) {
      console.error("通知設定エラー:", error);
      Alert.alert(
        "エラー",
        "通知の設定中にエラーが発生しました。"
      );
    } finally {
      setIsLoadingPermission(false);
    }
  };

  // 通知を無効化
  const handleDisableNotifications = async () => {
    Alert.alert(
      "通知を無効にする",
      "すべての通知を無効にしますか？",
      [
        { text: "キャンセル", style: "cancel" },
        {
          text: "無効にする",
          style: "destructive",
          onPress: async () => {
            await cancelAllNotifications();
            setNotificationEnabled(false);
          },
        },
      ]
    );
  };

  // 個別の通知設定が変更されたときの処理
  useEffect(() => {
    if (!isNotificationEnabled) return;

    // デイリーリマインダーの設定
    if (dailyReminder) {
      scheduleDailyReminder(dailyReminderTime.hour, dailyReminderTime.minute);
    } else {
      // デイリーリマインダーがOFFの場合はキャンセル
      cancelDailyReminder();
    }
  }, [isNotificationEnabled, dailyReminder, dailyReminderTime]);

  const notificationSettings = [
    {
      title: "デイリーリマインダー",
      subtitle: "1日1回、指定した時刻に家事登録を確認",
      value: dailyReminder,
      onValueChange: setDailyReminder,
      icon: "alarm",
      testID: "daily-reminder-switch",
    },
    // {
    //   title: "メンバーの活動",
    //   subtitle: "世帯メンバーが家事を登録した際に通知",
    //   value: memberActivity,
    //   onValueChange: setMemberActivity,
    //   icon: "people",
    //   testID: "member-activity-switch",
    // },
  ];

  return (
    <ScrollView className="flex-1 bg-gray-50 dark:bg-gray-900 pt-4">
        <View className="p-5">
          {/* メイン通知設定 */}
          <Card className="mb-6 p-4">
            <View className="flex-row items-center justify-between">
              <View className="flex-1">
                <Text className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
                  通知を許可
                </Text>
                <Text className="text-sm text-gray-600 dark:text-gray-400">
                  うさこからのお知らせを受け取る
                </Text>
              </View>
              <Switch
                testID="notification-main-switch"
                value={isNotificationEnabled}
                onValueChange={(value) => {
                  if (value) {
                    handleEnableNotifications();
                  } else {
                    handleDisableNotifications();
                  }
                }}
                disabled={isLoadingPermission}
                trackColor={{ false: "#767577", true: "#FF90BB" }}
                thumbColor={isNotificationEnabled ? "#FFC1DA" : "#f4f3f4"}
              />
            </View>
          </Card>

          {/* 個別通知設定 */}
          {isNotificationEnabled && (
            <>
              <View className="mb-4">
                <Text className="text-sm font-semibold text-gray-600 dark:text-gray-400 mb-2">
                  通知の種類
                </Text>
              </View>

              {notificationSettings.map((setting, index) => (
                <Card key={index} className="mb-3 p-4">
                  <View className="flex-row items-center justify-between">
                    <View className="flex-row items-center flex-1">
                      <View className="w-10 h-10 bg-pink-100 dark:bg-pink-900 rounded-full items-center justify-center mr-3">
                        <Ionicons
                          name={setting.icon as any}
                          size={20}
                          color="#FF90BB"
                        />
                      </View>
                      <View className="flex-1">
                        <Text className="text-base font-medium text-gray-900 dark:text-white mb-1">
                          {setting.title}
                        </Text>
                        <Text className="text-sm text-gray-600 dark:text-gray-400">
                          {setting.subtitle}
                        </Text>
                      </View>
                    </View>
                    <Switch
                      testID={setting.testID}
                      value={setting.value}
                      onValueChange={setting.onValueChange}
                      trackColor={{ false: "#767577", true: "#FF90BB" }}
                      thumbColor={setting.value ? "#FFC1DA" : "#f4f3f4"}
                    />
                  </View>
                  
                  {/* デイリーリマインダーの時間設定 */}
                  {setting.title === "デイリーリマインダー" && setting.value && (
                    <View className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                      <TimePicker
                        testID="daily-reminder-time-picker"
                        label="通知時刻"
                        value={dailyReminderTime}
                        onTimeChange={setDailyReminderTime}
                        format="24"
                      />
                    </View>
                  )}
                </Card>
              ))}

            </>
          )}

          {/* うさこ */}
          <View className="mt-8 items-center">
            <Image
              source={require("@/assets/images/usako_home.png")}
              className="w-16 h-16 mb-2"
              style={{ width: 64, height: 64 }}
            />
            <Text className="text-sm text-gray-500 dark:text-gray-400">
              {isNotificationEnabled
                ? "通知でお知らせするうさ〜！"
                : "通知を設定してうさ〜"}
            </Text>
          </View>
        </View>
      </ScrollView>
    );
}
