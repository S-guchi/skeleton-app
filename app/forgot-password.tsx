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
  const [usakoMessage, setUsakoMessage] = useState("パスワードを忘れちゃったうさ？大丈夫うさ〜！");
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
    setUsakoMessage("メール送信中うさ〜。ちょっと待っててね！");
    try {
      // Mock password reset API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      setIsSubmitted(true);
    } catch {
      setUsakoMessage("あれ？メールが送れないうさ。もう一度試してみてうさ〜。");
      Alert.alert("うさこからのお知らせ", "パスワードリセットメールの送信に失敗しちゃったうさ。");
    } finally {
      setIsLoading(false);
    }
  };

  if (isSubmitted) {
    return (
      <View className="flex-1 bg-usako-accent1 dark:bg-gray-900 px-6" style={{ paddingTop: insets.top + 16, paddingBottom: 32 }}>
        {/* 戻るボタン */}
        <TouchableOpacity 
          onPress={() => router.back()}
          className="self-start mb-6 p-2"
        >
          <View className="flex-row items-center">
            <Ionicons name="arrow-back" size={24} color="#FF90BB" />
            <Text className="text-usako-primary ml-2 font-medium">戻る</Text>
          </View>
        </TouchableOpacity>
        
        <View className="flex-1 justify-center">
          {/* うさこのキャラクター */}
          <View className="items-center mb-4">
            <Image 
              source={require("@/assets/images/usako_home.png")}
              style={{ width: 96, height: 96 }}
              resizeMode="contain"
            />
          </View>
          
          {/* 成功メッセージ */}
          <View className="mb-8 px-4">
            <View className="bg-white dark:bg-gray-800 border-2 border-gray-800 dark:border-gray-700 rounded-xl px-4 py-3">
              <Text className="text-gray-800 dark:text-gray-200 text-sm font-medium text-center">
                メール送信完了うさ〜！
              </Text>
            </View>
          </View>
          
          <Text className="text-2xl font-bold text-usako-primary dark:text-usako-primary-light mb-4 text-center">
            メールを確認してねうさ！
          </Text>
          <Text className="text-gray-600 dark:text-gray-400 text-center mb-8">
            パスワードリセットの手順を送ったうさ〜。
            メールボックスを確認してみてうさ！
          </Text>
          <Link href="/sign-in" asChild>
            <TouchableOpacity>
              <Button className="bg-usako-primary hover:bg-usako-primary-dark">
                <Text className="text-white font-semibold text-center">
                  ログイン画面に戻るうさ！
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
      <ScrollView className="flex-1 bg-usako-accent1 dark:bg-gray-900">
        <View className="flex-1 px-6" style={{ paddingTop: insets.top + 16, paddingBottom: 32 }}>
          {/* 戻るボタン */}
          <TouchableOpacity 
            onPress={() => router.back()}
            className="self-start mb-6 p-2"
          >
            <View className="flex-row items-center">
              <Ionicons name="arrow-back" size={24} color="#FF90BB" />
              <Text className="text-usako-primary ml-2 font-medium">戻る</Text>
            </View>
          </TouchableOpacity>
          
          {/* うさこのキャラクター */}
          <View className="items-center mb-4">
            <Image 
              source={require("@/assets/images/usako_home.png")}
              style={{ width: 80, height: 80 }}
              resizeMode="contain"
            />
          </View>
          
          {/* うさこのメッセージ */}
          <View className="mb-6 px-4">
            <View className="bg-white dark:bg-gray-800 border-2 border-gray-800 dark:border-gray-700 rounded-xl px-4 py-3">
              <Text className="text-gray-800 dark:text-gray-200 text-sm font-medium text-center">
                {usakoMessage}
              </Text>
            </View>
          </View>
          
          <View className="mb-8">
            <Text className="text-3xl font-bold text-usako-primary dark:text-usako-primary-light mb-2 text-center">
              パスワードリセット
            </Text>
            <Text className="text-gray-600 dark:text-gray-400 text-center">
              メールアドレスを入力してくださいうさ〜
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
            className="mb-4 bg-usako-primary hover:bg-usako-primary-dark"
          >
            <Text className="text-white font-semibold text-center">
              {isLoading ? "送信中うさ..." : "リセットメール送信うさ！"}
            </Text>
          </Button>

          <Link href="/sign-in" asChild>
            <TouchableOpacity>
              <Text className="text-usako-primary dark:text-usako-primary-light text-center">
                ログイン画面に戻るうさ
              </Text>
            </TouchableOpacity>
          </Link>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}