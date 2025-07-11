import * as Notifications from 'expo-notifications';
import { scheduleDailyReminder, cancelDailyReminder } from '@/lib/utils/notifications';

// expo-notificationsのモック
jest.mock('expo-notifications', () => ({
  scheduleNotificationAsync: jest.fn(),
  setNotificationHandler: jest.fn(),
  setNotificationChannelAsync: jest.fn(),
  getPermissionsAsync: jest.fn(),
  requestPermissionsAsync: jest.fn(),
  getExpoPushTokenAsync: jest.fn(),
  cancelAllScheduledNotificationsAsync: jest.fn(),
  cancelScheduledNotificationAsync: jest.fn(),
  getAllScheduledNotificationsAsync: jest.fn(),
  SchedulableTriggerInputTypes: {
    DAILY: 'daily',
  },
}));

describe('notifications', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('scheduleDailyReminder', () => {
    it('既存のデイリーリマインダーをキャンセルしてから新しいリマインダーをスケジュールする', async () => {
      const existingNotifications = [
        {
          identifier: 'old-reminder-1',
          content: { data: { type: 'daily_reminder' } },
        },
        {
          identifier: 'old-reminder-2',
          content: { data: { type: 'daily_reminder' } },
        },
        {
          identifier: 'other-notification',
          content: { data: { type: 'other' } },
        },
      ];
      (Notifications.getAllScheduledNotificationsAsync as jest.Mock).mockResolvedValue(existingNotifications);

      const mockNotificationId = 'test-notification-id';
      (Notifications.scheduleNotificationAsync as jest.Mock).mockResolvedValue(mockNotificationId);

      const result = await scheduleDailyReminder();

      // 既存のデイリーリマインダーのみキャンセルされることを確認
      expect(Notifications.cancelScheduledNotificationAsync).toHaveBeenCalledTimes(2);
      expect(Notifications.cancelScheduledNotificationAsync).toHaveBeenCalledWith('old-reminder-1');
      expect(Notifications.cancelScheduledNotificationAsync).toHaveBeenCalledWith('old-reminder-2');

      expect(Notifications.scheduleNotificationAsync).toHaveBeenCalledWith({
        content: {
          title: 'デイリーリマインダー',
          body: '今日の家事はいかがですか？うさ〜',
          data: { type: 'daily_reminder' },
          sound: true,
        },
        trigger: {
          type: 'daily',
          hour: 20,
          minute: 0,
        },
      });

      expect(result).toBe(mockNotificationId);
    });

    it('指定した時刻でデイリーリマインダーをスケジュールする', async () => {
      const mockNotificationId = 'test-notification-id';
      (Notifications.getAllScheduledNotificationsAsync as jest.Mock).mockResolvedValue([]);
      (Notifications.scheduleNotificationAsync as jest.Mock).mockResolvedValue(mockNotificationId);

      const result = await scheduleDailyReminder(8, 30);

      expect(Notifications.scheduleNotificationAsync).toHaveBeenCalledWith({
        content: {
          title: 'デイリーリマインダー',
          body: '今日の家事はいかがですか？うさ〜',
          data: { type: 'daily_reminder' },
          sound: true,
        },
        trigger: {
          type: 'daily',
          hour: 8,
          minute: 30,
        },
      });

      expect(result).toBe(mockNotificationId);
    });

    it('境界値の時刻でも正しく動作する', async () => {
      const mockNotificationId = 'test-notification-id';
      (Notifications.getAllScheduledNotificationsAsync as jest.Mock).mockResolvedValue([]);
      (Notifications.scheduleNotificationAsync as jest.Mock).mockResolvedValue(mockNotificationId);

      // 0時0分
      await scheduleDailyReminder(0, 0);
      expect(Notifications.scheduleNotificationAsync).toHaveBeenCalledWith(
        expect.objectContaining({
          trigger: {
            type: 'daily',
            hour: 0,
            minute: 0,
          },
        })
      );

      // 23時59分
      await scheduleDailyReminder(23, 59);
      expect(Notifications.scheduleNotificationAsync).toHaveBeenCalledWith(
        expect.objectContaining({
          trigger: {
            type: 'daily',
            hour: 23,
            minute: 59,
          },
        })
      );
    });

    it('エラーが発生した場合は適切に処理される', async () => {
      const mockError = new Error('Notification scheduling failed');
      (Notifications.getAllScheduledNotificationsAsync as jest.Mock).mockResolvedValue([]);
      (Notifications.scheduleNotificationAsync as jest.Mock).mockRejectedValue(mockError);

      await expect(scheduleDailyReminder()).rejects.toThrow('Notification scheduling failed');
    });
  });

  describe('cancelDailyReminder', () => {
    it('すべてのデイリーリマインダー通知をキャンセルする', async () => {
      const existingNotifications = [
        {
          identifier: 'reminder-1',
          content: { data: { type: 'daily_reminder' } },
        },
        {
          identifier: 'reminder-2',
          content: { data: { type: 'daily_reminder' } },
        },
        {
          identifier: 'other-notification',
          content: { data: { type: 'other' } },
        },
      ];
      (Notifications.getAllScheduledNotificationsAsync as jest.Mock).mockResolvedValue(existingNotifications);

      await cancelDailyReminder();

      // デイリーリマインダーのみキャンセルされることを確認
      expect(Notifications.cancelScheduledNotificationAsync).toHaveBeenCalledTimes(2);
      expect(Notifications.cancelScheduledNotificationAsync).toHaveBeenCalledWith('reminder-1');
      expect(Notifications.cancelScheduledNotificationAsync).toHaveBeenCalledWith('reminder-2');
    });

    it('デイリーリマインダーが存在しない場合は何もしない', async () => {
      (Notifications.getAllScheduledNotificationsAsync as jest.Mock).mockResolvedValue([
        {
          identifier: 'other-notification',
          content: { data: { type: 'other' } },
        },
      ]);

      await cancelDailyReminder();

      expect(Notifications.cancelScheduledNotificationAsync).not.toHaveBeenCalled();
    });
  });
});