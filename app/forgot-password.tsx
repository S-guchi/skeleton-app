import { View, Text, KeyboardAvoidingView, Platform, ScrollView, Alert, TouchableOpacity, Image } from "react-native";
import { Link, router } from "expo-router";
import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { useForm, Controller } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const forgotPasswordSchema = z.object({
  email: z.string().email("有効なメールアドレスを入力してください"),
});

type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;

export default function ForgotPasswordScreen() {
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [statusMessage, setStatusMessage] = useState("パスワードを忘れましたか？大丈夫です！");
  const insets = useSafeAreaInsets();

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: "",
    },
  });

  const onSubmit = async (data: ForgotPasswordFormData) => {
    setIsLoading(true);
    setStatusMessage("メール送信中です。少々お待ちください！");
    try {
      // Mock password reset API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      setIsSubmitted(true);
    } catch {
      setStatusMessage("メールの送信に失敗しました。もう一度試してみてください。");
      Alert.alert("エラー", "パスワードリセットメールの送信に失敗しました。");
    } finally {
      setIsLoading(false);
    }
  };

  if (isSubmitted) {
    return (
      <View className="flex-1 bg-blue-100 dark:bg-gray-900 px-6" style={{ paddingTop: insets.top + 16, paddingBottom: 32 }}>
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
        
        <View className="flex-1 justify-center">
          {/* アプリアイコン */}
          <View className="items-center mb-4">
            <View className="w-24 h-24 bg-blue-500 dark:bg-blue-600 rounded-full items-center justify-center">
              <Text className="text-5xl">🔑</Text>
            </View>
          </View>
          
          {/* 成功メッセージ */}
          <View className="mb-8 px-4">
            <View className="bg-white dark:bg-gray-800 border-2 border-gray-800 dark:border-gray-700 rounded-xl px-4 py-3">
              <Text className="text-gray-800 dark:text-gray-200 text-sm font-medium text-center">
                メール送信完了！
              </Text>
            </View>
          </View>
          
          <Text className="text-2xl font-bold text-blue-500 dark:text-blue-400 mb-4 text-center">
            メールを確認してください！
          </Text>
          <Text className="text-gray-600 dark:text-gray-400 text-center mb-8">
            パスワードリセットの手順を送信しました。
            メールボックスを確認してください！
          </Text>
          <Link href="/sign-in" asChild>
            <TouchableOpacity>
              <Button className="bg-blue-500 hover:bg-blue-600">
                <Text className="text-white font-semibold text-center">
                  ログイン画面に戻る
                </Text>
              </Button>
            </TouchableOpacity>
          </Link>
        </View>
      </View>
    );
  }

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
              <Text className="text-4xl">🔑</Text>
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
              パスワードリセット
            </Text>
            <Text className="text-gray-600 dark:text-gray-400 text-center">
              メールアドレスを入力してください
            </Text>
          </View>

          <View className="mb-6">
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

          <Button
            onPress={handleSubmit(onSubmit)}
            disabled={isLoading}
            className="mb-4 bg-blue-500 hover:bg-blue-600"
          >
            <Text className="text-white font-semibold text-center">
              {isLoading ? "送信中..." : "リセットメール送信"}
            </Text>
          </Button>

          <Link href="/sign-in" asChild>
            <TouchableOpacity>
              <Text className="text-blue-500 dark:text-blue-400 text-center">
                ログイン画面に戻る
              </Text>
            </TouchableOpacity>
          </Link>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}