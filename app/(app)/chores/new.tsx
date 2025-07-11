import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { useChore, useCreateChore, useUpdateChore } from "@/lib/hooks/useChoreOperations";
import { Ionicons } from "@expo/vector-icons";
import { zodResolver } from "@hookform/resolvers/zod";
import { router, useLocalSearchParams } from "expo-router";
import { useEffect } from "react";
import { Controller, useForm } from "react-hook-form";
import { Alert, Text, TouchableOpacity, View, KeyboardAvoidingView, ScrollView, TouchableWithoutFeedback, Keyboard, Platform } from "react-native";
import { z } from "zod";
import { UsakoIcon } from "@/components/ui/UsakoIcon";

const createChoreSchema = z.object({
  name: z.string().min(1, "家事名は必須です"),
  rewardAmount: z.number().min(0, "0以上を入力してください"),
});

type CreateChoreForm = z.infer<typeof createChoreSchema>;

export default function NewChoreScreen() {
  const { editId } = useLocalSearchParams<{ editId?: string }>();
  const isEditMode = !!editId;

  const createChoreMutation = useCreateChore();
  const updateChoreMutation = useUpdateChore();
  const { data: existingChore, isLoading: isLoadingChore } = useChore(editId);

  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<CreateChoreForm>({
    resolver: zodResolver(createChoreSchema),
    defaultValues: {
      name: "",
      rewardAmount: 0,
    },
  });

  // 編集モード時に既存データをフォームに設定
  useEffect(() => {
    if (isEditMode && existingChore) {
      reset({
        name: existingChore.name,
        rewardAmount: existingChore.reward_amount,
      });
    }
  }, [isEditMode, existingChore, reset]);

  const onSubmit = async (data: CreateChoreForm) => {
    try {
      if (isEditMode && editId) {
        await updateChoreMutation.mutateAsync({
          id: editId,
          updates: {
            name: data.name,
            rewardAmount: data.rewardAmount,
          },
        });
        Alert.alert(
          "更新完了",
          "家事項目を更新しました",
          [{ text: "OK", onPress: () => router.back() }]
        );
      } else {
        await createChoreMutation.mutateAsync({
          name: data.name,
          rewardAmount: data.rewardAmount,
        });
        Alert.alert(
          "追加完了",
          "家事項目を追加しました",
          [{ text: "OK", onPress: () => router.back() }]
        );
      }
    } catch (error) {
      console.error("Error saving chore:", error);
      Alert.alert("エラー", isEditMode ? "家事項目の更新に失敗しました" : "家事項目の追加に失敗しました");
    }
  };

  return (
    <KeyboardAvoidingView 
      className="flex-1 bg-gray-50 dark:bg-gray-900"
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      testID="keyboard-avoiding-view"
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss} testID="keyboard-dismiss-area">
        <View className="flex-1">
          {/* ヘッダー */}
          <View className="bg-usako-primary dark:bg-pink-600 px-5 pt-12 pb-6">
            <View className="flex-row items-center justify-between">
              <TouchableOpacity onPress={() => router.back()}>
                <Ionicons name="arrow-back" size={24} color="white" />
              </TouchableOpacity>
              <Text className="text-xl font-bold text-white">
                {isEditMode ? "家事項目を編集" : "家事項目を追加"}
              </Text>
              <View className="w-6" />
            </View>
          </View>

          <ScrollView 
            className="flex-1"
            contentContainerStyle={{ paddingHorizontal: 20, paddingVertical: 24 }}
            keyboardShouldPersistTaps="handled"
            testID="form-scroll-view"
          >
            {/* うさこのメッセージ */}
            <View className="mb-6 p-4 bg-pink-50 dark:bg-pink-900/20 rounded-lg">
              <View className="flex-row items-start">
                <UsakoIcon size="medium" style={{ marginRight: 12, marginTop: 2 }} />
                <View className="flex-1">
                  <Text className="text-sm text-gray-700 dark:text-gray-300">
                    {isEditMode
                      ? "家事項目を編集しましょううさ〜\nポイントも変更できますうさ〜"
                      : "新しい家事項目を追加しましょううさ〜\nポイントは皆で相談して決めてくださいうさ〜"
                    }
                  </Text>
                </View>
              </View>
            </View>

            {/* フォーム */}
            <View className="space-y-6">
              <View>
                <Text className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  家事名
                </Text>
                <Controller
                  control={control}
                  name="name"
                  render={({ field: { onChange, onBlur, value } }) => (
                    <Input
                      placeholder="例：食器洗い"
                      onBlur={onBlur}
                      onChangeText={onChange}
                      value={value}
                      error={errors.name?.message}
                      returnKeyType="next"
                    />
                  )}
                />
              </View>

              <View>
                <Text className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  報酬額（pt）
                </Text>
                <Controller
                  control={control}
                  name="rewardAmount"
                  render={({ field: { onChange, onBlur, value } }) => (
                    <Input
                      placeholder="例：100"
                      keyboardType="numeric"
                      returnKeyType="done"
                      onBlur={onBlur}
                      onChangeText={(text) => {
                        // 空文字の場合は0、それ以外は数値に変換
                        const numValue = text === '' ? 0 : parseInt(text, 10);
                        onChange(isNaN(numValue) ? 0 : numValue);
                      }}
                      value={value.toString()}
                      error={errors.rewardAmount?.message}
                    />
                  )}
                />
                <Text className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  家事の大変さに応じてポイントを設定してください
                </Text>
              </View>
            </View>

            {/* ボタン */}
            <View className="mt-12 space-y-3">
              <Button
                onPress={handleSubmit(onSubmit)}
                disabled={createChoreMutation.isPending || updateChoreMutation.isPending}
                isLoading={createChoreMutation.isPending || updateChoreMutation.isPending}
              >
                <Text className="text-white font-semibold text-center">
                  {isEditMode ? "更新する" : "追加する"}
                </Text>
              </Button>

              <Button
                variant="ghost"
                onPress={() => router.back()}
                disabled={createChoreMutation.isPending || updateChoreMutation.isPending}
              >
                <Text className="text-gray-600 dark:text-gray-400 text-center">
                  キャンセル
                </Text>
              </Button>
            </View>
          </ScrollView>
        </View>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
}
