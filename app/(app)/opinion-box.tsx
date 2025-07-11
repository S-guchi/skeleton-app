import { View, Text, KeyboardAvoidingView, Platform, ScrollView, Alert, TouchableOpacity, Image } from "react-native";
import { router } from "expo-router";
import { useState } from "react";
import { useSession } from "@/lib/contexts/SessionContext";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { opinionBoxSchema, type OpinionBoxFormData } from "@/lib/types/opinion-box";
import { supabase } from "@/lib/supabase";

export default function OpinionBoxScreen() {
  const [isLoading, setIsLoading] = useState(false);
  const [usakoMessage, setUsakoMessage] = useState("ご意見や改善点があれば、何でも聞かせてほしいうさ〜！");
  const { session } = useSession();
  const insets = useSafeAreaInsets();

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<OpinionBoxFormData>({
    resolver: zodResolver(opinionBoxSchema),
    defaultValues: {
      title: "",
      content: "",
      email: "",
    },
  });

  const onSubmit = async (data: OpinionBoxFormData) => {
    if (!data.title || !data.content) {
      setUsakoMessage("タイトルとご意見を入力してほしいうさ〜！");
      Alert.alert("うさこからのお知らせ", "タイトルとご意見を入力してほしいうさ〜！");
      return;
    }

    setIsLoading(true);
    setUsakoMessage("ご意見を送信中うさ〜。ちょっと待ってね！");

    try {
      const { error } = await supabase
        .from('opinion_box')
        .insert([
          {
            user_id: session?.user?.id || null,
            title: data.title,
            content: data.content,
            email: data.email || null,
          }
        ]);

      if (error) {
        throw error;
      }

      setIsLoading(false);
      setUsakoMessage("ご意見を送信したうさ〜！ありがとうございました！");
      
      Alert.alert(
        "送信完了",
        "ご意見をお送りいただき、ありがとうございます。\n今後のアプリ改善に活用させていただきます。",
        [
          {
            text: "OK",
            onPress: () => {
              reset();
              router.back();
            },
          }
        ]
      );
      
    } catch (error) {
      setIsLoading(false);
      const errorMessage = error instanceof Error ? error.message : "ご意見の送信に失敗しちゃったうさ。もう一度試してみてうさ〜。";
      setUsakoMessage("あれ？送信できないうさ。もう一度試してみてうさ〜。");
      Alert.alert("うさこからのお知らせ", errorMessage);
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
              ご意見箱
            </Text>
            <Text className="text-gray-600 dark:text-gray-400 text-center">
              みんなの声でアプリをもっと良くするうさ〜！
            </Text>
          </View>

          <View className="mb-6">
            <View className="mb-4">
              <Text className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                タイトル
              </Text>
              <Controller
                control={control}
                name="title"
                render={({ field: { onChange, onBlur, value } }) => (
                  <Input
                    placeholder="例：家事の追加機能について"
                    value={value}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    className="mb-1"
                  />
                )}
              />
              {errors.title && (
                <Text className="text-red-500 text-sm">{errors.title.message}</Text>
              )}
            </View>

            <View className="mb-4">
              <Text className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                ご意見・改善点など
              </Text>
              <Controller
                control={control}
                name="content"
                render={({ field: { onChange, onBlur, value } }) => (
                  <View className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-3">
                    <Input
                      placeholder="アプリの使いやすさや新機能のご要望など、どんなことでもお聞かせください"
                      value={value}
                      onChangeText={onChange}
                      onBlur={onBlur}
                      multiline
                      numberOfLines={6}
                      textAlignVertical="top"
                      className="border-0 bg-transparent p-0 min-h-[120px]"
                      style={{ textAlignVertical: 'top' }}
                    />
                  </View>
                )}
              />
              {errors.content && (
                <Text className="text-red-500 text-sm">{errors.content.message}</Text>
              )}
            </View>

            <View>
              <Text className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                送信用メールアドレス（任意）
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
              <Text className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                ご質問への回答が必要な場合のみご入力ください
              </Text>
            </View>
          </View>

          <View className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-700">
            <View className="flex-row items-start">
              <Ionicons name="information-circle" size={20} color="#3B82F6" className="mr-2 mt-0.5" />
              <View className="flex-1 ml-2">
                <Text className="text-blue-800 dark:text-blue-200 text-sm font-medium mb-1">
                  ご意見の取り扱いについて
                </Text>
                <Text className="text-blue-700 dark:text-blue-300 text-xs">
                  • いただいたご意見は今後の機能改善に活用いたします{"\n"}
                  • 個人を特定できる情報は記載しないでください{"\n"}
                  • 回答をご希望の場合はメールアドレスをご記入ください
                </Text>
              </View>
            </View>
          </View>

          <Button
            onPress={handleSubmit(onSubmit)}
            disabled={isLoading}
            className="mb-4 bg-usako-primary hover:bg-usako-primary-dark"
          >
            <Text className="text-white font-semibold text-center">
              {isLoading ? "送信中うさ..." : "ご意見を送信するうさ！"}
            </Text>
          </Button>

          <View className="items-center">
            <Text className="text-gray-600 dark:text-gray-400 text-sm text-center">
              みなさまからのご意見をお待ちしております。{"\n"}
              ありがとうございます うさ〜！
            </Text>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}