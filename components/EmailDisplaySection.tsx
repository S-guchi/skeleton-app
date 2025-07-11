import React from 'react';
import { View, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSession } from '@/lib/contexts/SessionContext';
import { useLocalization } from '@/lib/hooks/useLocalization';

export default function EmailDisplaySection() {
  const { session } = useSession();
  const { t } = useLocalization();

  // refreshSession呼び出しを削除：
  // - メール認証状態は既にsessionから取得可能
  // - refreshSessionがonAuthStateChangeをトリガーしてローディング状態の競合を引き起こしていた
  // - 実際のメール認証状態更新はバックグラウンドで自動的に行われる

  // ユーザーがログインしていない場合は何も表示しない
  if (!session?.user) {
    return null;
  }

  const user = session.user;
  const isEmailVerified = !!user.email_confirmed_at;

  return (
    <View className="flex-row items-center">
      <View className="flex-1">
        <Text className="text-sm text-gray-600 dark:text-gray-400">
          {user.email}
        </Text>
        <Text className={`text-xs ${isEmailVerified ? 'text-green-600 dark:text-green-400' : 'text-orange-600 dark:text-orange-400'}`}>
          {isEmailVerified ? t('settings.emailVerified') : t('settings.pleaseVerifyEmail')}
        </Text>
      </View>
      <Ionicons
        testID={isEmailVerified ? 'verified-icon' : 'unverified-icon'}
        name={isEmailVerified ? 'checkmark-circle' : 'warning'}
        size={20}
        color={isEmailVerified ? '#22C55E' : '#F59E0B'}
      />
    </View>
  );
}