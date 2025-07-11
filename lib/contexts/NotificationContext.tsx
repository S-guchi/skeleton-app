import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface DailyReminderTime {
  hour: number;
  minute: number;
}

interface NotificationState {
  // 通知全体の有効/無効
  isNotificationEnabled: boolean;
  // 個別の通知設定
  dailyReminder: boolean;
  dailyReminderTime: DailyReminderTime;
  memberActivity: boolean;

  // Actions
  setNotificationEnabled: (enabled: boolean) => void;
  setDailyReminder: (enabled: boolean) => void;
  setDailyReminderTime: (time: DailyReminderTime) => void;
  setMemberActivity: (enabled: boolean) => void;
}

const NotificationContext = createContext<NotificationState>({
  isNotificationEnabled: false,
  dailyReminder: false,
  dailyReminderTime: { hour: 20, minute: 0 },
  memberActivity: false,
  setNotificationEnabled: () => {},
  setDailyReminder: () => {},
  setDailyReminderTime: () => {},
  setMemberActivity: () => {},
});

interface NotificationProviderProps {
  children: ReactNode;
}

const STORAGE_KEYS = {
  NOTIFICATION_ENABLED: 'notification_enabled',
  DAILY_REMINDER: 'daily_reminder',
  DAILY_REMINDER_TIME: 'daily_reminder_time',
  MEMBER_ACTIVITY: 'member_activity',
};

export const NotificationProvider: React.FC<NotificationProviderProps> = ({ children }) => {
  const [isNotificationEnabled, setIsNotificationEnabledState] = useState(false);
  const [dailyReminder, setDailyReminderState] = useState(false);
  const [dailyReminderTime, setDailyReminderTimeState] = useState<DailyReminderTime>({ hour: 20, minute: 0 });
  const [memberActivity, setMemberActivityState] = useState(false);

  // 初期化
  useEffect(() => {
    const loadSettings = async () => {
      try {
        const [notificationEnabled, dailyReminderEnabled, dailyReminderTimeString, memberActivityEnabled] = await Promise.all([
          AsyncStorage.getItem(STORAGE_KEYS.NOTIFICATION_ENABLED),
          AsyncStorage.getItem(STORAGE_KEYS.DAILY_REMINDER),
          AsyncStorage.getItem(STORAGE_KEYS.DAILY_REMINDER_TIME),
          AsyncStorage.getItem(STORAGE_KEYS.MEMBER_ACTIVITY),
        ]);

        setIsNotificationEnabledState(notificationEnabled === 'true');
        setDailyReminderState(dailyReminderEnabled === 'true');
        setMemberActivityState(memberActivityEnabled === 'true');

        // 保存された時間設定を復元
        if (dailyReminderTimeString) {
          try {
            const parsedTime = JSON.parse(dailyReminderTimeString);
            if (parsedTime.hour !== undefined && parsedTime.minute !== undefined) {
              setDailyReminderTimeState(parsedTime);
            }
          } catch (parseError) {
            console.error('Failed to parse daily reminder time:', parseError);
            // パースに失敗した場合はデフォルト値を使用
          }
        }
      } catch (error) {
        console.error('Failed to load notification settings:', error);
      }
    };

    loadSettings();
  }, []);

  const setNotificationEnabled = async (enabled: boolean) => {
    try {
      setIsNotificationEnabledState(enabled);
      await AsyncStorage.setItem(STORAGE_KEYS.NOTIFICATION_ENABLED, enabled.toString());
    } catch (error) {
      console.error('Failed to save notification enabled setting:', error);
    }
  };

  const setDailyReminder = async (enabled: boolean) => {
    try {
      setDailyReminderState(enabled);
      await AsyncStorage.setItem(STORAGE_KEYS.DAILY_REMINDER, enabled.toString());
    } catch (error) {
      console.error('Failed to save daily reminder setting:', error);
    }
  };

  const setDailyReminderTime = async (time: DailyReminderTime) => {
    try {
      // 時間の妥当性チェック
      if (time.hour < 0 || time.hour > 23 || time.minute < 0 || time.minute > 59) {
        console.error('Invalid time values:', time);
        return;
      }

      setDailyReminderTimeState(time);
      await AsyncStorage.setItem(STORAGE_KEYS.DAILY_REMINDER_TIME, JSON.stringify(time));
    } catch (error) {
      console.error('Failed to save daily reminder time setting:', error);
    }
  };

  const setMemberActivity = async (enabled: boolean) => {
    try {
      setMemberActivityState(enabled);
      await AsyncStorage.setItem(STORAGE_KEYS.MEMBER_ACTIVITY, enabled.toString());
    } catch (error) {
      console.error('Failed to save member activity setting:', error);
    }
  };

  return (
    <NotificationContext.Provider
      value={{
        isNotificationEnabled,
        dailyReminder,
        dailyReminderTime,
        memberActivity,
        setNotificationEnabled,
        setDailyReminder,
        setDailyReminderTime,
        setMemberActivity,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotificationStore = (): NotificationState => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotificationStore must be used within a NotificationProvider');
  }
  return context;
};