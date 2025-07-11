import React from 'react';
import { render, waitFor } from '@testing-library/react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { NotificationProvider, useNotificationStore } from '@/lib/contexts/NotificationContext';

// AsyncStorageのモック
jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(),
  setItem: jest.fn(),
}));

import { Text, View } from 'react-native';

// テスト用のコンポーネント
const TestComponent: React.FC = () => {
  const {
    isNotificationEnabled,
    dailyReminder,
    dailyReminderTime,
    memberActivity,
    setNotificationEnabled,
    setDailyReminder,
    setDailyReminderTime,
    setMemberActivity,
  } = useNotificationStore();

  return (
    <View>
      <Text testID="notification-enabled">{isNotificationEnabled.toString()}</Text>
      <Text testID="daily-reminder">{dailyReminder.toString()}</Text>
      <Text testID="daily-reminder-time">{JSON.stringify(dailyReminderTime)}</Text>
      <Text testID="member-activity">{memberActivity.toString()}</Text>
    </View>
  );
};

describe('NotificationContext', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('初期化', () => {
    it('デフォルト値が正しく設定される', () => {
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(null);

      const { getByTestId } = render(
        <NotificationProvider>
          <TestComponent />
        </NotificationProvider>
      );

      expect(getByTestId('notification-enabled')).toHaveTextContent('false');
      expect(getByTestId('daily-reminder')).toHaveTextContent('false');
      expect(getByTestId('daily-reminder-time')).toHaveTextContent('{"hour":20,"minute":0}');
      expect(getByTestId('member-activity')).toHaveTextContent('false');
    });

    it('保存された設定が正しく復元される', async () => {
      (AsyncStorage.getItem as jest.Mock)
        .mockResolvedValueOnce('true') // notification_enabled
        .mockResolvedValueOnce('true') // daily_reminder
        .mockResolvedValueOnce('{"hour":8,"minute":30}') // daily_reminder_time
        .mockResolvedValueOnce('false'); // member_activity

      const { getByTestId } = render(
        <NotificationProvider>
          <TestComponent />
        </NotificationProvider>
      );

      await waitFor(() => {
        expect(getByTestId('notification-enabled')).toHaveTextContent('true');
        expect(getByTestId('daily-reminder')).toHaveTextContent('true');
        expect(getByTestId('daily-reminder-time')).toHaveTextContent('{"hour":8,"minute":30}');
        expect(getByTestId('member-activity')).toHaveTextContent('false');
      });
    });
  });

  describe('デイリーリマインダー時間設定', () => {
    it('時間設定が正しく保存される', async () => {
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(null);
      (AsyncStorage.setItem as jest.Mock).mockResolvedValue(undefined);

      const TestSetTimeComponent: React.FC = () => {
        const { setDailyReminderTime } = useNotificationStore();

        React.useEffect(() => {
          setDailyReminderTime({ hour: 9, minute: 15 });
        }, [setDailyReminderTime]);

        return <TestComponent />;
      };

      const { getByTestId } = render(
        <NotificationProvider>
          <TestSetTimeComponent />
        </NotificationProvider>
      );

      await waitFor(() => {
        expect(AsyncStorage.setItem).toHaveBeenCalledWith(
          'daily_reminder_time',
          '{"hour":9,"minute":15}'
        );
        expect(getByTestId('daily-reminder-time')).toHaveTextContent('{"hour":9,"minute":15}');
      });
    });

    it('無効な時間設定が拒否される', async () => {
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(null);
      (AsyncStorage.setItem as jest.Mock).mockResolvedValue(undefined);

      const TestInvalidTimeComponent: React.FC = () => {
        const { setDailyReminderTime } = useNotificationStore();

        React.useEffect(() => {
          // 無効な時間設定をテスト
          setDailyReminderTime({ hour: 25, minute: 70 });
        }, [setDailyReminderTime]);

        return <TestComponent />;
      };

      const { getByTestId } = render(
        <NotificationProvider>
          <TestInvalidTimeComponent />
        </NotificationProvider>
      );

      await waitFor(() => {
        // 無効な時間設定は保存されず、デフォルト値が保持される
        expect(getByTestId('daily-reminder-time')).toHaveTextContent('{"hour":20,"minute":0}');
      });
    });
  });

  describe('エラーハンドリング', () => {
    it('AsyncStorageのエラーが適切に処理される', async () => {
      (AsyncStorage.getItem as jest.Mock).mockRejectedValue(new Error('AsyncStorage error'));
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

      render(
        <NotificationProvider>
          <TestComponent />
        </NotificationProvider>
      );

      await waitFor(() => {
        expect(consoleSpy).toHaveBeenCalledWith(
          'Failed to load notification settings:',
          expect.any(Error)
        );
      });

      consoleSpy.mockRestore();
    });
  });
});