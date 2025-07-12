import EmailDisplaySection from "@/components/EmailDisplaySection";
import AvatarPicker from "@/components/ui/AvatarPicker";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { useSession } from "@/lib/contexts/SessionContext";
import { useUser } from "@/lib/contexts/UserContext";
import { useLocalization } from "@/lib/hooks/useLocalization";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useState } from "react";
import { Alert, Linking, Modal, ScrollView, Text, TouchableOpacity, View } from "react-native";

export default function SettingsScreen() {
  const { user, updateUser, refreshUser } = useUser();
  const { signOut, session } = useSession();
  const { t, setLocale, availableLocales, currentLocale } = useLocalization();
  const [isLoading, setIsLoading] = useState(false);
  const [showLanguageModal, setShowLanguageModal] = useState(false);

  const handleLanguageChange = async (localeCode: string) => {
    try {
      await setLocale(localeCode);
      setShowLanguageModal(false);

      // Show success message
      Alert.alert(
        t('common.success'),
        t('settings.languageChanged')
      );
    } catch (error) {
      console.error('Error changing language:', error);
      Alert.alert(
        t('common.error'),
        t('errors.unknownError')
      );
    }
  };

  const handleAvatarUpdate = async (newAvatarUrl: string) => {
    try {
      console.log('Before updateUser, current user avatar:', user?.avatar_url);
      await updateUser({ avatar_url: newAvatarUrl });
      console.log('After updateUser, before refresh');
      // ユーザー情報を再読み込みして最新の状態を反映
      await refreshUser();
      console.log('After refreshUser, current user avatar:', user?.avatar_url);
      Alert.alert(
        '成功',
        'アイコンが更新されました'
      );
    } catch (error) {
      console.error('Failed to update avatar in user context:', error);
      Alert.alert(
        'エラー',
        'アイコンの保存に失敗しました。もう一度お試しください。'
      );
    }
  };


  const handleSignOut = () => {
    Alert.alert(
      t('settings.logout'),
      t('settings.logoutConfirm'),
      [
        { text: t('common.cancel'), style: "cancel" },
        {
          text: t('settings.logout'),
          style: "destructive",
          onPress: async () => {
            setIsLoading(true);
            try {
              await signOut();
              router.replace("/welcome");
            } catch {
              Alert.alert(t('common.error'), t('errors.unknownError'));
            } finally {
              setIsLoading(false);
            }
          }
        }
      ]
    );
  };

  const handleAboutApp = async () => {
    const url = process.env.EXPO_PUBLIC_ABOUT_APP_URL || 'https://yourapp.com';

    try {
      const canOpen = await Linking.canOpenURL(url);
      if (canOpen) {
        await Linking.openURL(url);
      } else {
        Alert.alert('エラー', 'ブラウザを開くことができませんでした');
      }
    } catch {
      Alert.alert('エラー', 'ページを開くことができませんでした');
    }
  };

  // 匿名ユーザーかどうかを判定
  const isAnonymousUser = session?.user?.is_anonymous === true;

  const menuItems = [
    {
      title: "アカウント設定",
      icon: "person",
      items: [
        // {
        //   title: t('settings.language'),
        //   subtitle: availableLocales.find(locale => locale.code === currentLocale)?.name || "Language",
        //   onPress: () => setShowLanguageModal(true),
        //   disabled: false,
        // },
        {
          title: isAnonymousUser ? "メールアドレス登録" : "メール認証済み！",
          subtitle: isAnonymousUser ? "未登録の場合、スマホ破損時や機種変更時にデータ復旧ができません。ご登録をお願いします。" : "アカウントは安全に保護されています",
          onPress: () => {
            if (isAnonymousUser) {
              router.push("/(app)/email-upgrade");
            }
          },
          disabled: false,
          id: 'email-registration', // 識別用ID追加
        },
        {
          title: t('settings.notifications'),
          subtitle: t('settings.notifications'),
          onPress: () => router.push("/(app)/notification-settings"),
          disabled: false,
        },
      ],
    },
    {
      title: "アプリ情報・サポート",
      icon: "information-circle",
      items: [
        {
          title: "プライバシーポリシー",
          subtitle: "個人情報の取り扱いについて",
          onPress: () => router.push("/(app)/privacy-policy"),
          disabled: false,
        },
        {
          title: "利用規約",
          subtitle: "サービス利用条件について",
          onPress: () => router.push("/(app)/terms-of-service"),
          disabled: false,
        },
        {
          title: t('settings.aboutApp'),
          subtitle: t('settings.aboutAppSubtitle'),
          onPress: handleAboutApp,
          disabled: false,
        },
        {
          title: "アカウント削除方法",
          subtitle: "アカウントの削除手順について",
          onPress: () => router.push("/(app)/account-deletion"),
          disabled: false,
        },
        {
          title: "ご意見箱",
          subtitle: "ご意見・改善点をお聞かせください",
          onPress: () => router.push("/(app)/opinion-box"),
          disabled: false,
        },
      ],
    },
  ];

  return (
    <ScrollView className="flex-1 bg-gray-50 dark:bg-gray-900">
      {/* ユーザー情報 */}
      <Card className="mx-5 mt-6 mb-4 p-4">
        <View className="flex-row items-center">
          <View className="mr-4">
            <AvatarPicker
              userId={user?.id || ''}
              currentAvatarUrl={user?.avatar_url}
              onUpdate={handleAvatarUpdate}
              size="lg"
            />
          </View>
          <View className="flex-1">
            <Text className="text-lg font-semibold text-gray-900 dark:text-white">
              {user?.name}
            </Text>
            <EmailDisplaySection />
          </View>
        </View>
      </Card>

      {/* メニュー */}
      <View className="px-5 pb-6">
        {menuItems.map((section, sectionIndex) => (
          <View key={sectionIndex} className="mb-6">
            <View className="flex-row items-center mb-3">
              <Ionicons
                name={section.icon as any}
                size={20}
                color="#6B7280"
              />
              <Text className="text-sm font-semibold text-gray-600 dark:text-gray-400 ml-2">
                {section.title}
              </Text>
            </View>
            <Card className="overflow-hidden">
              {section.items.map((item, itemIndex) => (
                <TouchableOpacity
                  key={itemIndex}
                  onPress={item.disabled ? undefined : item.onPress}
                  disabled={item.disabled}
                  className={`px-4 py-3 border-b border-gray-200 dark:border-gray-700 last:border-b-0 ${item.disabled ? 'opacity-60' : ''
                    }`}
                >
                  <View className="flex-row items-center justify-between">
                    <View className="flex-1">
                      <Text className={`text-base ${item.disabled
                          ? 'text-green-600 dark:text-green-400'
                          : 'text-gray-900 dark:text-white'
                        }`}>
                        {item.title}
                      </Text>
                      <Text className={`text-sm ${item.disabled
                          ? 'text-green-500 dark:text-green-500'
                          : item.id === 'email-registration' && isAnonymousUser
                          ? 'text-orange-600 dark:text-orange-400'
                          : 'text-gray-600 dark:text-gray-400'
                        }`}>
                        {item.subtitle}
                      </Text>
                    </View>
                    {item.disabled ? (
                      <Ionicons
                        name="checkmark-circle"
                        size={20}
                        color="#10B981"
                      />
                    ) : (
                      <Ionicons
                        name="chevron-forward"
                        size={20}
                        color="#9CA3AF"
                      />
                    )}
                  </View>
                </TouchableOpacity>
              ))}
            </Card>
          </View>
        ))}


        {/* ログアウトボタン - メール認証済みユーザーのみ表示 */}
        {!isAnonymousUser && (
          <Button
            variant="secondary"
            onPress={handleSignOut}
            disabled={isLoading}
            isLoading={isLoading}
            className="mt-4"
          >
            <Text className="text-red-600 dark:text-red-400 text-center font-semibold">
              {t('settings.logout')}
            </Text>
          </Button>
        )}

        {/* Debug Locale (development only) */}
        {__DEV__ && (
          <View className="mt-4">
            <Text className="text-xs text-gray-500 mb-2">Development Debug:</Text>
            <View className="bg-yellow-100 p-3 rounded-lg">
              <Text className="text-xs mb-1">Current Locale: {t('common.loading')}</Text>
              <Text className="text-xs mb-1">Navigation Home: {t('navigation.home')}</Text>
              <Text className="text-xs">Auth Sign In: {t('auth.signIn')}</Text>
            </View>
          </View>
        )}

        {/* アプリ情報 */}
        <View className="mt-8 items-center">
          <Text className="text-xs text-gray-500 dark:text-gray-500">
            アプリバージョン v1.0.0
          </Text>
        </View>
      </View>

      {/* 言語選択モーダル */}
      <Modal
        visible={showLanguageModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowLanguageModal(false)}
      >
        <View className="flex-1 justify-end bg-black bg-opacity-50">
          <View className="bg-white dark:bg-gray-800 rounded-t-lg p-6">
            <View className="flex-row items-center justify-between mb-6">
              <Text className="text-lg font-bold text-gray-900 dark:text-white">
                {t('settings.changeLanguage')}
              </Text>
              <TouchableOpacity onPress={() => setShowLanguageModal(false)}>
                <Ionicons name="close" size={24} color="#6B7280" />
              </TouchableOpacity>
            </View>

            {availableLocales.map((locale) => (
              <TouchableOpacity
                key={locale.code}
                onPress={() => handleLanguageChange(locale.code)}
                className="flex-row items-center justify-between py-4 border-b border-gray-100 dark:border-gray-700"
              >
                <Text
                  className={`text-base ${currentLocale === locale.code
                      ? 'font-bold text-pink-500'
                      : 'text-gray-900 dark:text-white'
                    }`}
                >
                  {locale.name}
                </Text>
                {currentLocale === locale.code && (
                  <Ionicons name="checkmark" size={20} color="#EC4899" />
                )}
              </TouchableOpacity>
            ))}

            <TouchableOpacity
              onPress={() => setShowLanguageModal(false)}
              className="mt-6 py-3 bg-gray-100 dark:bg-gray-700 rounded-lg"
            >
              <Text className="text-center text-base font-medium text-gray-700 dark:text-gray-300">
                {t('common.cancel')}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>


    </ScrollView>
  );
}
