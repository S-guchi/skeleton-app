import { View, Text, KeyboardAvoidingView, Platform, ScrollView, Alert, TouchableOpacity, Image } from "react-native";
import { router } from "expo-router";
import { useState } from "react";
import { useUser } from "@/lib/contexts/UserContext";
import { useSession } from "@/lib/contexts/SessionContext";
import { getAuthErrorMessage } from "@/lib/utils/authErrorMessages";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { useForm, Controller } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const emailUpgradeSchema = z.object({
  email: z.string().email("有効なメールアドレスを入力してください"),
  password: z.string().min(6, "パスワードは6文字以上必要です"),
});

type EmailUpgradeFormData = z.infer<typeof emailUpgradeSchema>;

export default function EmailUpgradeScreen() {
  const [isLoading, setIsLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState("メールアドレスを登録してデータを守りましょう！");
  const { user } = useUser();
  const { upgradeToEmailUser } = useSession();
  const insets = useSafeAreaInsets();

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<EmailUpgradeFormData>({
    resolver: zodResolver(emailUpgradeSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (data: EmailUpgradeFormData) => {
    if (!data || !data.email || !data.password) {
      setStatusMessage("メールアドレスとパスワードを入力してください！");
      Alert.alert("エラー", "メールアドレスとパスワードを入力してください！");
      return;
    }
    
    if (!user?.name) {
      Alert.alert("エラー", "ユーザー情報が取得できません");
      return;
    }
    
    setIsLoading(true);
    setStatusMessage("アカウントを昇格中です。少々お待ちください！");
    
    try {
      await upgradeToEmailUser(data.email, data.password, user.name);
      
      // 認証が成功した後、非同期で状態更新完了を待つ
      await new Promise(resolve => setTimeout(resolve, 500));
      
      setIsLoading(false);
      setStatusMessage("認証メールを送信しました！メールボックスを確認してください！");
      
      Alert.alert(
        "認証メール送信完了",
        "認証メールを送信しました。\nメールボックスを確認し、認証リンクをクリックしてアカウント登録を完了してください。",
        [
          {
            text: "OK",
            onPress: () => {
              // メイン画面に戻る（より確実な遷移）
              router.replace("/");
            },
          }
        ]
      );
      
    } catch (error) {
      setIsLoading(false);
      const errorMessage = getAuthErrorMessage(error);
      setStatusMessage("アカウント昇格に失敗しました。入力内容を確認してください。");
      Alert.alert("エラー", errorMessage);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      className="flex-1"
    >
      <ScrollView className="flex-1 bg-blue-100 dark:bg-gray-900">
        <View className="flex-1 px-6" style={{ paddingTop: insets.top + 16, paddingBottom: 32 }}>
          {/* 戻るボタン */}
          <TouchableOpacity 
            onPress={() => router.back()}
            className="self-start mb-6 p-2"
          >
            <View className="flex-row items-center">
              <Ionicons name="arrow-back" size={24} color="#3B82F6" />
              <Text className="text-blue-500 ml-2 font-medium">戻る</Text>
            </View>
          </TouchableOpacity>
          
          {/* アプリアイコン */}
          <View className="items-center mb-4">
            <View className="w-20 h-20 bg-blue-500 dark:bg-blue-600 rounded-full items-center justify-center">
              <Text className="text-4xl">📧</Text>
            </View>
          </View>
          
          {/* ステータスメッセージ */}
          <View className="mb-6 px-4">
            <View className="bg-white dark:bg-gray-800 border-2 border-gray-800 dark:border-gray-700 rounded-xl px-4 py-3">
              <Text className="text-gray-800 dark:text-gray-200 text-sm font-medium text-center">
                {statusMessage}
              </Text>
            </View>
          </View>
          
          <View className="mb-8">
            <Text className="text-3xl font-bold text-blue-500 dark:text-blue-400 mb-2 text-center">
              メールアカウント登録
            </Text>
            <Text className="text-gray-600 dark:text-gray-400 text-center">
              データを安全に保存しましょう！
            </Text>
          </View>

          <View className="mb-6">
            <View className="mb-4 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <Text className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                使用する名前
              </Text>
              <Text className="text-base text-gray-900 dark:text-white font-medium">
                {user?.name || "名前が設定されていません"}
              </Text>
              <Text className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                現在のアカウント名をそのまま使用します
              </Text>
            </View>

            <View className="mb-4">
              <Text className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                メールアドレス
              </Text>
              <Controller
                control={control}
                name="email"
                render={({ field: { onChange, onBlur, value } }) => (
                  <Input
                    placeholder="example@email.com"
                    value={value}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    autoCapitalize="none"
                    keyboardType="email-address"
                    className="mb-1"
                  />
                )}
              />
              {errors.email && (
                <Text className="text-red-500 text-sm">{errors.email.message}</Text>
              )}
            </View>

            <View>
              <Text className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                パスワード
              </Text>
              <Controller
                control={control}
                name="password"
                render={({ field: { onChange, onBlur, value } }) => (
                  <Input
                    placeholder="••••••••"
                    value={value}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    secureTextEntry
                    autoCapitalize="none"
                    autoCorrect={false}
                    className="mb-1"
                  />
                )}
              />
              {errors.password && (
                <Text className="text-red-500 text-sm">{errors.password.message}</Text>
              )}
            </View>
          </View>

          <View className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-700">
            <View className="flex-row items-start">
              <Ionicons name="information-circle" size={20} color="#3B82F6" className="mr-2 mt-0.5" />
              <View className="flex-1 ml-2">
                <Text className="text-blue-800 dark:text-blue-200 text-sm font-medium mb-1">
                  メールアカウント登録のメリット
                </Text>
                <Text className="text-blue-700 dark:text-blue-300 text-xs">
                  • アプリを削除してもデータを復旧できます{"\n"}
                  • 複数のデバイスでデータを同期できます{"\n"}
                  • より安全にデータを保護できます
                </Text>
              </View>
            </View>
          </View>

          <Button
            onPress={handleSubmit(onSubmit)}
            disabled={isLoading}
            className="mb-4 bg-blue-500 hover:bg-blue-600"
          >
            <Text className="text-white font-semibold text-center">
              {isLoading ? "登録中..." : "メールアカウント登録"}
            </Text>
          </Button>

          <View className="items-center">
            <Text className="text-gray-600 dark:text-gray-400 text-sm text-center">
              登録することで、データを安全に保護し、{"\n"}
              アプリを削除しても復旧できるようになります
            </Text>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}