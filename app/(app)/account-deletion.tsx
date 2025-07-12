import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { useLocalization } from "@/lib/hooks/useLocalization";
import { deleteAccount } from "@/lib/services/authService";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useState } from "react";
import { Alert, ScrollView, Text, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function AccountDeletionScreen() {
  const { t } = useLocalization();
  const insets = useSafeAreaInsets();
  const [isDeleting, setIsDeleting] = useState(false);

  const handleBack = () => {
    router.back();
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      "アカウント削除の確認",
      "本当にアカウントを削除しますか？\n\n⚠️ この操作は取り消すことができません\n⚠️ すべてのデータが完全に削除されます\n⚠️ 世帯から自動的に退会されます",
      [
        {
          text: "キャンセル",
          style: "cancel"
        },
        {
          text: "削除する",
          style: "destructive",
          onPress: () => confirmDeleteAccount()
        }
      ]
    );
  };

  const confirmDeleteAccount = () => {
    Alert.alert(
      "最終確認",
      "アカウント削除を実行します。この操作は絶対に取り消せません。\n\n削除を続行しますか？",
      [
        {
          text: "やめる",
          style: "cancel"
        },
        {
          text: "削除を実行",
          style: "destructive",
          onPress: executeDeleteAccount
        }
      ]
    );
  };

  const executeDeleteAccount = async () => {
    setIsDeleting(true);
    try {
      await deleteAccount();
      // サインアウトされてwelcome画面に自動遷移
      Alert.alert(
        "削除完了",
        "アカウントの削除が完了しました。ご利用ありがとうございました。",
        [
          {
            text: "OK",
            onPress: () => router.replace("/welcome")
          }
        ]
      );
    } catch (error) {
      Alert.alert(
        "削除エラー",
        error instanceof Error ? error.message : "アカウント削除に失敗しました。しばらくしてから再試行してください。"
      );
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <View className="flex-1 bg-gray-50 dark:bg-gray-900">
      {/* ヘッダー */}
      <View
        className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700"
        style={{ paddingTop: insets.top }}
      >
        <View className="flex-row items-center justify-between px-5 py-4">
          <TouchableOpacity
            onPress={handleBack}
            className="flex-row items-center py-2 pr-4"
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Ionicons name="chevron-back" size={24} color="#6B7280" />
            <Text className="text-base font-medium text-gray-700 dark:text-gray-300 ml-1">
              {t('common.back')}
            </Text>
          </TouchableOpacity>
          <Text className="text-lg font-bold text-gray-900 dark:text-white">
            {t('accountDeletion.title')}
          </Text>
          <View className="w-16" />
        </View>
      </View>

      {/* コンテンツ */}
      <ScrollView className="flex-1">
        <View className="px-5 py-6">
          <Card className="p-6">
            <Text className="text-lg font-bold text-gray-900 dark:text-white mb-4">
              アカウント削除方法
            </Text>

            <Text className="text-sm text-gray-700 dark:text-gray-300 mb-6 leading-relaxed">
              {{APP_NAME}}のアカウント削除について、以下の手順と注意事項をご確認ください。
            </Text>

            {/* 重要な注意事項 */}
            <View className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
              <View className="flex-row items-center mb-3">
                <Ionicons name="warning" size={20} color="#DC2626" />
                <Text className="text-base font-bold text-red-700 dark:text-red-400 ml-2">
                  アカウント削除前の重要な注意事項
                </Text>
              </View>
              <Text className="text-sm text-red-700 dark:text-red-300 leading-relaxed mb-2">
                • 一度削除されたアカウントは復旧できません
              </Text>
              <Text className="text-sm text-red-700 dark:text-red-300 leading-relaxed mb-2">
                • すべての家事記録とデータが完全に削除されます
              </Text>
              <Text className="text-sm text-red-700 dark:text-red-300 leading-relaxed mb-2">
                • 世帯から自動的に退会し、他のメンバーに影響する可能性があります
              </Text>
              <Text className="text-sm text-red-700 dark:text-red-300 leading-relaxed">
                • 削除前に必要なデータはバックアップしてください
              </Text>
            </View>

            {/* データのバックアップ */}
            <View className="mb-6">
              <Text className="text-base font-bold text-gray-900 dark:text-white mb-3">
                データのバックアップ
              </Text>
              <Text className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed mb-3">
                削除前に重要なデータをバックアップすることをお勧めします：
              </Text>
              <View className="ml-4">
                <Text className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed mb-2">
                  • 家事記録の履歴データ
                </Text>
                <Text className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed mb-2">
                  • 月次精算の記録
                </Text>
                <Text className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed mb-2">
                  • 世帯設定情報
                </Text>
                <Text className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                  • カスタム家事項目の設定
                </Text>
              </View>
            </View>

            {/* 削除手順 */}
            <View className="mb-6">
              <Text className="text-base font-bold text-gray-900 dark:text-white mb-3">
                削除手順
              </Text>
              <Text className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
                アカウントの削除は以下の手順で行います：
              </Text>

              <View className="mb-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <Text className="text-sm font-bold text-gray-900 dark:text-white mb-2">
                  ステップ 1: データのエクスポート（推奨）
                </Text>
                <Text className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                  必要に応じて、履歴画面からデータをエクスポートまたはスクリーンショットを保存してください。
                </Text>
              </View>

              <View className="mb-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <Text className="text-sm font-bold text-gray-900 dark:text-white mb-2">
                  ステップ 2: アカウント削除の実行
                </Text>
                <Text className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                  このページ下部の「アカウントを削除する」ボタンをタップすると、アカウントが削除され、参加している世帯からも自動的に退会されます。
                </Text>
              </View>
            </View>

            {/* 削除後の影響 */}
            <View className="mb-6">
              <Text className="text-base font-bold text-gray-900 dark:text-white mb-3">
                削除後の影響
              </Text>
              <Text className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed mb-3">
                アカウント削除後に発生する変化について：
              </Text>
              <View className="ml-4">
                <Text className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed mb-2">
                  • アプリへのログインができなくなります
                </Text>
                <Text className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed mb-2">
                  • すべての個人データが完全に削除されます
                </Text>
                <Text className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed mb-2">
                  • 世帯内での家事記録が「退会済みユーザー」として表示される場合があります
                </Text>
                <Text className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                  • 月次精算の履歴からも除外されます
                </Text>
              </View>
            </View>

            {/* 再登録について */}
            <View className="mb-6">
              <Text className="text-base font-bold text-gray-900 dark:text-white mb-3">
                再登録について
              </Text>
              <Text className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed mb-3">
                削除後の再登録については以下の点にご注意ください：
              </Text>
              <View className="ml-4">
                <Text className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed mb-2">
                  • 同じメールアドレスで再登録が可能です
                </Text>
                <Text className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed mb-2">
                  • 過去のデータは一切復旧されません
                </Text>
                <Text className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed mb-2">
                  • 新規ユーザーとして最初から設定が必要です
                </Text>
                <Text className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                  • 世帯への再参加も新規招待が必要です
                </Text>
              </View>
            </View>

            <View className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
              <Text className="text-sm text-gray-600 dark:text-gray-400 text-center">
                ご不明な点がございましたら、削除前にお気軽にお問い合わせください。
              </Text>
            </View>
          </Card>

          {/* アカウント削除ボタン */}
          <View className="mt-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
            <View className="flex-row items-center mb-3">
              <Ionicons name="warning" size={20} color="#DC2626" />
              <Text className="text-base font-bold text-red-700 dark:text-red-400 ml-2">
                危険操作
              </Text>
            </View>
            <Text className="text-sm text-red-700 dark:text-red-300 leading-relaxed mb-4">
              上記の手順とリスクを理解した上で、今すぐアカウントを削除したい場合は下のボタンをタップしてください。
            </Text>
            <Button
              variant="secondary"
              onPress={handleDeleteAccount}
              disabled={isDeleting}
              isLoading={isDeleting}
              className="bg-red-600 border-red-600"
            >
              <Text className="text-white text-center font-semibold">
                アカウントを削除する
              </Text>
            </Button>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}
