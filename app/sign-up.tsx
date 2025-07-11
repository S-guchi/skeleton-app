import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { useSession } from "@/lib/contexts/SessionContext";
import { getAuthErrorMessage } from "@/lib/utils/authErrorMessages";
import { Ionicons } from "@expo/vector-icons";
import { zodResolver } from "@hookform/resolvers/zod";
import { Link, router } from "expo-router";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { Alert, Image, KeyboardAvoidingView, Platform, ScrollView, Text, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { z } from "zod";

const registerSchema = z.object({
  name: z.string().min(2, "名前は2文字以上必要です"),
  email: z.string().email("有効なメールアドレスを入力してください"),
  password: z.string().min(6, "パスワードは6文字以上必要です"),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "パスワードが一致しません",
  path: ["confirmPassword"],
});

type RegisterFormData = z.infer<typeof registerSchema>;

export default function SignUpScreen() {
  const [isLoading, setIsLoading] = useState(false);
  const [usakoMessage, setUsakoMessage] = useState("うさこの家事ノートへようこそうさ〜！\n一緒に家事をがんばろーうさ！");
  const { signUp, isAuthLoading } = useSession();
  const insets = useSafeAreaInsets();

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  const onSubmit = async (data: RegisterFormData) => {
    setIsLoading(true);
    setUsakoMessage("アカウント作成中うさ〜。もうちょっとで完成うさ！");
    console.log('Sign up form submitted:', data);
    try {
      await signUp(data.email, data.password, data.name);
      console.log('Sign up successful, navigation will be handled by state change');
      setUsakoMessage("ようこそうさ〜！これから一緒に家事をがんばろうね！");

      // メール認証に関するガイダンスポップアップを表示
      Alert.alert(
        "認証メールを送信しました！",
        "メールボックスを確認して、届いたメール内の認証リンクをクリックしてください。\n\n※メールが届かない場合は迷惑メールフォルダもご確認ください",
        [
          {
            text: "確認しました",
            style: "default"
          }
        ]
      );

      // Force a check by logging session state after signup
      console.log('Signup completed, checking if Index component will re-render...');

      // Don't manually navigate - let the state change trigger navigation
    } catch (error) {
      console.error('Signup error:', error);
      const errorMessage = getAuthErrorMessage(error);
      setUsakoMessage("あれ？登録できないうさ。別のメールアドレスで試してみてうさ〜。");
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
              アカウントを作って始めよううさ〜！
            </Text>
          </View>

          <View className="mb-6">
            <View className="mb-4">
              <Text className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                お名前
              </Text>
              <Controller
                control={control}
                name="name"
                render={({ field: { onChange, onBlur, value } }) => (
                  <Input
                    placeholder="山田太郎"
                    value={value}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    className="mb-1"
                  />
                )}
              />
              {errors.name && (
                <Text className="text-red-500 text-sm">{errors.name.message}</Text>
              )}
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

            <View className="mb-4">
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
                    autoComplete="new-password"
                    textContentType="newPassword"
                    spellCheck={false}
                    passwordRules="minlength: 6;"
                    className="mb-1"
                  />
                )}
              />
              {errors.password && (
                <Text className="text-red-500 text-sm">{errors.password.message}</Text>
              )}
            </View>

            <View>
              <Text className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                パスワード（確認）
              </Text>
              <Controller
                control={control}
                name="confirmPassword"
                render={({ field: { onChange, onBlur, value } }) => (
                  <Input
                    placeholder="••••••••"
                    value={value}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    secureTextEntry
                    autoCapitalize="none"
                    autoCorrect={false}
                    autoComplete="off"
                    textContentType="password"
                    spellCheck={false}
                    className="mb-1"
                  />
                )}
              />
              {errors.confirmPassword && (
                <Text className="text-red-500 text-sm">{errors.confirmPassword.message}</Text>
              )}
            </View>
          </View>

          <Button
            onPress={handleSubmit(onSubmit)}
            disabled={isLoading || isAuthLoading}
            className="mb-4 bg-usako-primary hover:bg-usako-primary-dark"
          >
            <Text className="text-white font-semibold text-center">
              {(isLoading || isAuthLoading) ? "登録中うさ..." : "アカウント作成うさ！"}
            </Text>
          </Button>


          <View className="flex-row items-center justify-center">
            <Text className="text-gray-600 dark:text-gray-400">
              すでにアカウントをお持ちの方は
            </Text>
            <Link href="/sign-in" asChild>
              <TouchableOpacity className="ml-1">
                <Text className="text-usako-primary dark:text-usako-primary-light font-semibold">
                  ログインうさ
                </Text>
              </TouchableOpacity>
            </Link>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
