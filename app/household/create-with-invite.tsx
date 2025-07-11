import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { APP_CONSTANTS, DEFAULT_CHORES } from "@/lib/constants";
import { useSession } from "@/lib/contexts/SessionContext";
import { useUser } from "@/lib/contexts/UserContext";
import { updateUserProfile } from "@/lib/services/authService";
import { supabase } from "@/lib/supabase";
import { createInviteCode } from "@/lib/utils/inviteCodes";
import { Ionicons } from "@expo/vector-icons";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import * as Clipboard from 'expo-clipboard';
import { router } from "expo-router";
import { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { Alert, Image, KeyboardAvoidingView, Platform, ScrollView, Share, Text, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { z } from "zod";

const createHouseholdSchema = z.object({
  userName: z.string()
    .min(1, "お名前は必須です")
    .max(50, "お名前は50文字以内で入力してください"),
  name: z.string()
    .min(1, "家族グループ名は必須です"),
});

type CreateHouseholdForm = z.infer<typeof createHouseholdSchema>;

interface CreatedHousehold {
  id: string;
  name: string;
  inviteCode?: string;
}

export default function CreateHouseholdWithInviteScreen() {
  const { signInAnonymously, session } = useSession();
  const { user, refreshUser } = useUser();
  const [isInitializing, setIsInitializing] = useState(true);
  const [hasTriedAuth, setHasTriedAuth] = useState(false);
  const [createdHousehold, setCreatedHousehold] = useState<CreatedHousehold | null>(null);
  const insets = useSafeAreaInsets();

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<CreateHouseholdForm>({
    resolver: zodResolver(createHouseholdSchema),
    defaultValues: {
      userName: "",
      name: "",
    },
  });

  const createHouseholdMutation = useMutation({
    mutationFn: async (data: CreateHouseholdForm) => {
      if (__DEV__) console.log('🏠 Starting household creation...', { data });

      // ユーザーが認証されていない場合はエラー
      if (!user) {
        throw new Error('ユーザー認証に失敗しました。アプリを再起動して、もう一度お試しください。');
      }

      // 世帯を作成
      if (__DEV__) console.log('🏠 Creating household...', { userId: user.id });
      const { data: household, error: householdError } = await supabase
        .from("households")
        .insert({
          name: data.name,
          settlement_day: APP_CONSTANTS.DEFAULT_SETTLEMENT_DAY,
        })
        .select()
        .single();

      if (householdError) {
        if (__DEV__) console.error('🏠 Household creation failed:', householdError);
        throw householdError;
      }

      if (__DEV__) console.log('🏠 Household created successfully:', household.id);

      // 作成者を管理者として追加
      if (__DEV__) console.log('🏠 Adding user as admin member...');
      const { error: memberError } = await supabase
        .from("household_members")
        .insert({
          household_id: household.id,
          user_id: user.id,
          role: "admin",
        });

      if (memberError) {
        if (__DEV__) console.error('🏠 Member creation failed:', memberError);
        throw memberError;
      }

      if (__DEV__) console.log('🏠 Admin member added successfully');

      // 標準家事を自動作成
      if (__DEV__) console.log('🏠 Creating default chores...', { count: DEFAULT_CHORES.length });
      const defaultChoresData = DEFAULT_CHORES.map((chore) => ({
        household_id: household.id,
        name: chore.name,
        description: chore.description,
        reward_amount: chore.reward_amount,
        order_index: chore.order_index,
        is_active: true,
        created_by: user.id,
      }));

      if (__DEV__) console.log('🏠 Chores data prepared:', defaultChoresData);

      const { error: choresError } = await supabase
        .from("chores")
        .insert(defaultChoresData);

      if (choresError) {
        if (__DEV__) console.error('🏠 Chores creation failed:', choresError);
        console.error('Failed to create default chores:', choresError);
        throw choresError;
      }

      if (__DEV__) console.log('🏠 Default chores created successfully');

      // 招待コードを生成
      if (__DEV__) console.log('🏠 Creating invite code...');
      const inviteResult = await createInviteCode(household.id, user.id, 24); // 24時間有効

      if (!inviteResult.success || !inviteResult.inviteCode) {
        console.error('Failed to create invite code:', inviteResult.error);
        // 招待コード作成に失敗してもエラーとしない（後で手動作成可能）
      }

      // ユーザー名を更新（匿名ユーザーの場合）
      if (user && user.name === 'Anonymous User') {
        if (__DEV__) console.log('🏠 Updating user profile...', { name: data.userName });
        await updateUserProfile(user.id, { name: data.userName });
        if (__DEV__) console.log('🏠 User profile updated successfully');
      }

      if (__DEV__) console.log('🏠 Household creation completed successfully!');

      return {
        household,
        inviteCode: inviteResult.inviteCode?.code,
      };
    },
    onSuccess: async (result) => {
      // ユーザー情報を再取得してオンボーディング状態を更新
      await refreshUser();

      // 作成結果を画面に表示
      setCreatedHousehold({
        id: result.household.id,
        name: result.household.name,
        inviteCode: result.inviteCode,
      });
    },
  });

  // 匿名認証を自動実行
  useEffect(() => {
    const initializeUser = async () => {
      if (__DEV__) console.log('🔄 Initializing user...', { session: !!session, hasTriedAuth });

      if (!session && !hasTriedAuth) {
        if (__DEV__) console.log('🔄 Attempting anonymous sign in...');
        setHasTriedAuth(true);
        try {
          await signInAnonymously();
          if (__DEV__) console.log('🔄 Anonymous sign in successful');
        } catch (error) {
          if (__DEV__) console.error('🔄 Anonymous sign in failed:', error);
          // 匿名認証失敗でも処理を続行
        }
      }
      setIsInitializing(false);
    };

    if (isInitializing && !hasTriedAuth) {
      initializeUser();
    } else if (session || hasTriedAuth) {
      setIsInitializing(false);
    }
  }, [session, signInAnonymously, isInitializing, hasTriedAuth]);

  const onSubmit = async (data: CreateHouseholdForm) => {
    try {
      await createHouseholdMutation.mutateAsync(data);
    } catch (error) {
      console.error("Error creating household:", error);

      let errorMessage = "家族グループの作成に失敗しました";
      if (error && typeof error === 'object') {
        if ('message' in error && typeof error.message === 'string') {
          errorMessage += `\n詳細: ${error.message}`;
        }
        if (__DEV__) {
          console.error("Detailed error:", JSON.stringify(error, null, 2));
        }
      }

      Alert.alert("エラー", errorMessage);
    }
  };

  const handleCopyInviteCode = async () => {
    if (createdHousehold?.inviteCode) {
      await Clipboard.setStringAsync(createdHousehold.inviteCode);
      Alert.alert("コピー完了", "招待コードをクリップボードにコピーしました");
    }
  };

  const handleShareInviteCode = async () => {
    if (createdHousehold?.inviteCode) {
      try {
        await Share.share({
          message: `家族グループ「${createdHousehold.name}」に招待します！\n\n招待コード: ${createdHousehold.inviteCode}\n\n（24時間有効）\n\nうさこの家事ノートで一緒に家事を記録しましょう🐰`,
          title: "家族グループ招待",
        });
      } catch (error) {
        console.error("Error sharing invite code:", error);
      }
    }
  };

  const handleGoToApp = () => {
    router.replace("/(app)/(tabs)");
  };

  if (isInitializing) {
    return (
      <View className="flex-1 bg-usako-accent1 dark:bg-gray-900 justify-center items-center">
        <Text className="text-gray-600 dark:text-gray-400">初期化中...</Text>
      </View>
    );
  }

  // 作成完了画面
  if (createdHousehold) {
    return (
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1"
      >
        <ScrollView className="flex-1 bg-usako-accent1 dark:bg-gray-900">
          <View className="flex-1 px-6" style={{ paddingTop: insets.top + 16, paddingBottom: 32 }}>
            {/* うさこのキャラクター */}
            <View className="items-center mb-4">
              <Image
                source={require("@/assets/images/usako_home.png")}
                style={{ width: 80, height: 80 }}
                resizeMode="contain"
              />
            </View>

            {/* 成功メッセージ */}
            <View className="mb-8">
              <Text className="text-3xl font-bold text-usako-primary dark:text-usako-primary-light mb-2 text-center">
                🎉 作成完了！
              </Text>
              <Text className="text-lg font-bold text-gray-900 dark:text-white mb-2 text-center">
                「{createdHousehold.name}」グループができたうさ！
              </Text>
              <Text className="text-gray-600 dark:text-gray-400 text-center">
                家族を招待して一緒に家事を記録しましょう
              </Text>
            </View>

            {/* 招待コード表示 */}
            {createdHousehold.inviteCode && (
              <View className="mb-6 p-4 bg-white dark:bg-gray-800 rounded-lg border border-usako-primary/20">
                <Text className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 text-center">
                  招待コード（24時間有効）
                </Text>
                <Text className="text-2xl font-bold text-usako-primary text-center mb-4 tracking-widest">
                  {createdHousehold.inviteCode}
                </Text>

                <View className="flex-row space-x-2">
                  <Button
                    onPress={handleCopyInviteCode}
                    className="flex-1 bg-gray-500 hover:bg-gray-600"
                  >
                    <View className="flex-row items-center justify-center">
                      <Ionicons name="copy-outline" size={16} color="white" />
                      <Text className="text-white font-medium ml-1">コピー</Text>
                    </View>
                  </Button>

                  <Button
                    onPress={handleShareInviteCode}
                    className="flex-1 bg-usako-primary hover:bg-usako-primary-dark"
                  >
                    <View className="flex-row items-center justify-center">
                      <Ionicons name="share-outline" size={16} color="white" />
                      <Text className="text-white font-medium ml-1">共有</Text>
                    </View>
                  </Button>
                </View>
              </View>
            )}

            {/* 説明 */}
            <View className="mb-6 p-4 bg-usako-accent2/20 dark:bg-gray-800 rounded-lg">
              <Text className="text-sm text-gray-600 dark:text-gray-400 text-center">
                家族に招待コードを教えて、うさこの家事ノートで参加してもらいましょう！
                招待コードは24時間で期限切れになります。
              </Text>
            </View>

            {/* アプリ開始ボタン */}
            <Button
              onPress={handleGoToApp}
              className="bg-usako-primary hover:bg-usako-primary-dark"
            >
              <Text className="text-white font-semibold text-center">
                アプリを開始する
              </Text>
            </Button>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    );
  }

  // 作成フォーム画面
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

          {/* ヘッダー */}
          <View className="mb-8">
            <Text className="text-3xl font-bold text-usako-primary dark:text-usako-primary-light mb-2 text-center">
              うさこの家事ノート
            </Text>
            <Text className="text-lg font-bold text-gray-900 dark:text-white mb-2 text-center">
              家族グループを作成するうさ！
            </Text>
            <Text className="text-gray-600 dark:text-gray-400 text-center">
              グループ名を決めて、家族を招待しましょう
            </Text>
          </View>

          {/* フォーム */}
          <View className="mb-6">
            <View className="mb-4">
              <Text className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                お名前
              </Text>
              <Controller
                control={control}
                name="userName"
                render={({ field: { onChange, onBlur, value } }) => (
                  <Input
                    placeholder="山田太郎"
                    onBlur={onBlur}
                    onChangeText={onChange}
                    value={value}
                    className="mb-1"
                  />
                )}
              />
              {errors.userName && (
                <Text className="text-red-500 text-sm">{errors.userName.message}</Text>
              )}
            </View>

            <View className="mb-4">
              <Text className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                家族グループ名
              </Text>
              <Controller
                control={control}
                name="name"
                render={({ field: { onChange, onBlur, value } }) => (
                  <Input
                    placeholder="山田家族"
                    onBlur={onBlur}
                    onChangeText={onChange}
                    value={value}
                    autoCapitalize="none"
                    className="mb-1"
                  />
                )}
              />
              {errors.name && (
                <Text className="text-red-500 text-sm">{errors.name.message}</Text>
              )}
              <Text className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                家族を招待するための招待コードを自動生成します
              </Text>
            </View>
          </View>

          {/* ボタン */}
          <Button
            onPress={handleSubmit(onSubmit)}
            disabled={createHouseholdMutation.isPending}
            className="mb-4 bg-usako-primary hover:bg-usako-primary-dark"
          >
            <Text className="text-white font-semibold text-center">
              {createHouseholdMutation.isPending ? "作成中うさ..." : "家族グループを作成する"}
            </Text>
          </Button>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
