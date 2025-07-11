import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { useSession } from "@/lib/contexts/SessionContext";
import { useUser } from "@/lib/contexts/UserContext";
import { updateUserProfile } from "@/lib/services/authService";
import { supabase } from "@/lib/supabase";
import { isInviteCodeValid, markInviteCodeAsUsed } from "@/lib/utils/inviteCodes";
import { Ionicons } from "@expo/vector-icons";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { router } from "expo-router";
import { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { Alert, Image, KeyboardAvoidingView, Platform, ScrollView, Text, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { z } from "zod";

const joinHouseholdSchema = z.object({
  userName: z.string()
    .min(1, "お名前は必須です")
    .max(50, "お名前は50文字以内で入力してください"),
  inviteCode: z.string()
    .min(6, "招待コードは6文字です")
    .max(6, "招待コードは6文字です")
    .regex(/^[A-Z0-9]+$/, "招待コードは英数字のみです"),
});

type JoinHouseholdForm = z.infer<typeof joinHouseholdSchema>;

export default function JoinHouseholdWithInviteScreen() {
  const { signInAnonymously, session } = useSession();
  const { user, refreshUser } = useUser();
  const [isInitializing, setIsInitializing] = useState(true);
  const [hasTriedAuth, setHasTriedAuth] = useState(false);
  const insets = useSafeAreaInsets();

  const {
    control,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<JoinHouseholdForm>({
    resolver: zodResolver(joinHouseholdSchema),
    defaultValues: {
      userName: "",
      inviteCode: "",
    },
  });

  const inviteCodeValue = watch("inviteCode");

  // 招待コードの大文字変換
  useEffect(() => {
    if (inviteCodeValue && inviteCodeValue !== inviteCodeValue.toUpperCase()) {
      setValue("inviteCode", inviteCodeValue.toUpperCase());
    }
  }, [inviteCodeValue, setValue]);

  const joinHouseholdMutation = useMutation({
    mutationFn: async (data: JoinHouseholdForm) => {
      // ユーザーが認証されていない場合はエラー
      if (!user) {
        throw new Error('ユーザー認証に失敗しました。アプリを再起動して、もう一度お試しください。');
      }

      // 招待コードの有効性をチェック
      const validation = await isInviteCodeValid(data.inviteCode);

      if (!validation.isValid || !validation.inviteCode) {
        let errorMessage = "招待コードが無効です";

        switch (validation.reason) {
          case 'expired':
            errorMessage = "招待コードの有効期限が切れています";
            break;
          case 'used':
            errorMessage = "この招待コードは既に使用されています";
            break;
          case 'not_found':
            errorMessage = "招待コードが見つかりません";
            break;
          case 'error':
            errorMessage = validation.error || "招待コードの確認中にエラーが発生しました";
            break;
        }

        throw new Error(errorMessage);
      }

      // すでにメンバーかチェック
      const { data: existingMember } = await supabase
        .from("household_members")
        .select()
        .eq("household_id", validation.inviteCode.household_id)
        .eq("user_id", user.id)
        .single();

      if (existingMember) {
        // すでにメンバーの場合はログインとして扱う
        if (__DEV__) console.log('🔄 User is already a member, treating as login');
        return validation.inviteCode;
      }

      // 招待コードを使用済みとしてマーク
      const markResult = await markInviteCodeAsUsed(validation.inviteCode.id, user.id);

      if (!markResult.success) {
        throw new Error('招待コードの使用処理に失敗しました: ' + markResult.error);
      }

      // メンバーとして追加
      const { error: memberError } = await supabase
        .from("household_members")
        .insert({
          household_id: validation.inviteCode.household_id,
          user_id: user.id,
          role: "member",
        });

      if (memberError) throw memberError;

      // ユーザー名を更新（匿名ユーザーの場合）
      if (user && user.name === 'Anonymous User') {
        await updateUserProfile(user.id, { name: data.userName });
      }

      // 世帯情報を取得して返す
      const { data: household, error: householdError } = await supabase
        .from("households")
        .select("*")
        .eq("id", validation.inviteCode.household_id)
        .single();

      if (householdError) throw householdError;

      return household;
    },
    onSuccess: async () => {
      // ユーザー情報を再取得してオンボーディング状態を更新
      await refreshUser();
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

  const onSubmit = async (data: JoinHouseholdForm) => {
    try {
      const household = await joinHouseholdMutation.mutateAsync(data);

      Alert.alert(
        "家族グループに参加しました！",
        `${household.name}グループへようこそうさ〜\nみんなで家事をがんばりましょう！`,
        [{
          text: "OK",
          onPress: () => {
            router.replace("/(app)/(tabs)");
          }
        }]
      );
    } catch (error: any) {
      console.error("Error joining household:", error);
      Alert.alert("エラー", error.message || "家族グループへの参加に失敗しました");
    }
  };

  if (isInitializing) {
    return (
      <View className="flex-1 bg-usako-accent1 dark:bg-gray-900 justify-center items-center">
        <Text className="text-gray-600 dark:text-gray-400">初期化中...</Text>
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

          {/* ヘッダー */}
          <View className="mb-8">
            <Text className="text-3xl font-bold text-usako-primary dark:text-usako-primary-light mb-2 text-center">
              うさこの家事ノート
            </Text>
            <Text className="text-lg font-bold text-gray-900 dark:text-white mb-2 text-center">
              招待コードで参加するうさ！
            </Text>
            <Text className="text-gray-600 dark:text-gray-400 text-center">
              家族から教えてもらった招待コードを入力してくださいうさ〜
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
                    placeholder="山田花子"
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

            <View>
              <Text className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                招待コード（6文字）
              </Text>
              <Controller
                control={control}
                name="inviteCode"
                render={({ field: { onChange, onBlur, value } }) => (
                  <Input
                    placeholder="ABC123"
                    onBlur={onBlur}
                    onChangeText={onChange}
                    value={value}
                    keyboardType="ascii-capable"
                    autoCapitalize="characters"
                    autoCorrect={false}
                    spellCheck={false}
                    maxLength={6}
                    className="mb-1 text-center text-lg tracking-widest font-mono"
                  />
                )}
              />
              {errors.inviteCode && (
                <Text className="text-red-500 text-sm">{errors.inviteCode.message}</Text>
              )}
              <Text className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                家族から教えてもらった6文字の招待コードを入力してください
              </Text>
            </View>
          </View>

          {/* ボタン */}
          <Button
            onPress={handleSubmit(onSubmit)}
            disabled={joinHouseholdMutation.isPending}
            className="mb-4 bg-usako-primary hover:bg-usako-primary-dark"
          >
            <Text className="text-white font-semibold text-center">
              {joinHouseholdMutation.isPending ? "参加中うさ..." : "家族グループに参加する"}
            </Text>
          </Button>

          {/* 説明 */}
          <View className="mt-4 p-4 bg-usako-accent2/20 dark:bg-gray-800 rounded-lg">
            <Text className="text-sm text-gray-600 dark:text-gray-400 text-center">
              招待コードは24時間で期限切れになります。
              期限が切れている場合は、家族に新しい招待コードを生成してもらってください。
            </Text>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
