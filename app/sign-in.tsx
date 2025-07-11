import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { useSession } from "@/lib/contexts/SessionContext";
import { Ionicons } from "@expo/vector-icons";
import { zodResolver } from "@hookform/resolvers/zod";
import { Link, router } from "expo-router";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { Alert, Image, KeyboardAvoidingView, Platform, ScrollView, Text, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { z } from "zod";

const loginSchema = z.object({
  email: z.string().email("有効なメールアドレスを入力してください"),
  password: z.string().min(6, "パスワードは6文字以上必要です"),
});

type LoginFormData = z.infer<typeof loginSchema>;

export default function SignInScreen() {
  const [isLoading, setIsLoading] = useState(false);
  const [usakoMessage, setUsakoMessage] = useState("うさこの家事ノートへおかえりなさいうさ〜！");
  const { signIn, isAuthLoading } = useSession();
  const insets = useSafeAreaInsets();

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (data: LoginFormData) => {
    if (!data || !data.email || !data.password) {
      setUsakoMessage("メールアドレスとパスワードを入力してほしいうさ〜！");
      Alert.alert("うさこからのお知らせ", "メールアドレスとパスワードを入力してほしいうさ〜！");
      return;
    }

    setIsLoading(true);
    setUsakoMessage("ログイン中うさ〜。ちょっと待っててね！");

    try {
      await signIn(data.email, data.password);
      setUsakoMessage("おかえりなさいうさ〜！いっしょに家事をがんばろうね！");
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "ログインに失敗しちゃったうさ。メールアドレスとパスワードを確認してほしいうさ〜。";
      setUsakoMessage("あれ？ログインできないうさ。メールアドレスとパスワードを確認してみてうさ〜。");
      Alert.alert("うさこからのお知らせ", errorMessage);
    } finally {
      // 常にローカルのローディング状態をリセット
      setIsLoading(false);
    }
  };


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
              うさこの家事ノート
            </Text>
            <Text className="text-gray-600 dark:text-gray-400 text-center">
              おかえりなさいうさ〜！
            </Text>
          </View>

          <View className="mb-6">
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
                    autoComplete="current-password"
                    textContentType="password"
                    spellCheck={false}
                    className="mb-1"
                  />
                )}
              />
              {errors.password && (
                <Text className="text-red-500 text-sm">{errors.password.message}</Text>
              )}
            </View>
          </View>

          <Link href="/forgot-password" asChild>
            <TouchableOpacity className="mb-6">
              <Text className="text-usako-primary dark:text-usako-primary-light text-sm text-right">
                パスワードを忘れちゃったうさ？
              </Text>
            </TouchableOpacity>
          </Link>

          <Button
            onPress={handleSubmit(onSubmit)}
            disabled={isLoading || isAuthLoading}
            className="mb-4 bg-usako-primary hover:bg-usako-primary-dark"
          >
            <Text className="text-white font-semibold text-center">
              {(isLoading || isAuthLoading) ? "ログイン中うさ..." : "ログインうさ！"}
            </Text>
          </Button>


          <View className="flex-row items-center justify-center">
            <Text className="text-gray-600 dark:text-gray-400">
              アカウントをお持ちでない方は
            </Text>
            <Link href="/sign-up" asChild>
              <TouchableOpacity className="ml-1">
                <Text className="text-usako-primary dark:text-usako-primary-light font-semibold">
                  新規登録うさ
                </Text>
              </TouchableOpacity>
            </Link>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
