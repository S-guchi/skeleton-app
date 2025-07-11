import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { SchedulableTriggerInputTypes } from 'expo-notifications';

// 通知ハンドラーの設定
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export async function registerForPushNotificationsAsync() {
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'default',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#FF90BB',
    });
  }

  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;
  
  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }
  
  if (finalStatus !== 'granted') {
    console.log('通知の許可が得られませんでした');
    return false;
  }
  
  return true;
}

// デイリーリマインダー通知
export async function scheduleDailyReminder(hour: number = 20, minute: number = 0) {
  // 既存のデイリーリマインダーをすべてキャンセル
  const existingNotifications = await Notifications.getAllScheduledNotificationsAsync();
  for (const notification of existingNotifications) {
    if (notification.content.data?.type === 'daily_reminder') {
      await Notifications.cancelScheduledNotificationAsync(notification.identifier);
    }
  }

  const trigger: Notifications.DailyTriggerInput = {
    type: SchedulableTriggerInputTypes.DAILY,
    hour,
    minute,
  };
  
  return await Notifications.scheduleNotificationAsync({
    content: {
      title: 'デイリーリマインダー',
      body: '今日の家事はいかがですか？うさ〜',
      data: { type: 'daily_reminder' },
      sound: true,
    },
    trigger,
  });
}

// すべての通知をキャンセル
export async function cancelAllNotifications() {
  await Notifications.cancelAllScheduledNotificationsAsync();
}

// 特定の通知をキャンセル
export async function cancelNotification(notificationId: string) {
  await Notifications.cancelScheduledNotificationAsync(notificationId);
}

// デイリーリマインダーをキャンセル
export async function cancelDailyReminder() {
  const existingNotifications = await Notifications.getAllScheduledNotificationsAsync();
  for (const notification of existingNotifications) {
    if (notification.content.data?.type === 'daily_reminder') {
      await Notifications.cancelScheduledNotificationAsync(notification.identifier);
    }
  }
}