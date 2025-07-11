import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { useChores, useDeleteChore } from "@/lib/hooks/useChoreOperations";
import type { Chore } from "@/lib/types/supabase";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { ActivityIndicator, Alert, FlatList, Text, TouchableOpacity, View } from "react-native";
import { UsakoIcon } from "@/components/ui/UsakoIcon";

export default function ChoresScreen() {
  const { data: chores = [], isLoading } = useChores();
  const deleteChoreMutation = useDeleteChore();

  const handleDeleteChore = (choreId: string, choreName: string) => {
    Alert.alert(
      "削除確認",
      `「${choreName}」を削除してもよろしいですか？`,
      [
        { text: "キャンセル", style: "cancel" },
        {
          text: "削除",
          style: "destructive",
          onPress: async () => {
            try {
              await deleteChoreMutation.mutateAsync(choreId);
              Alert.alert("削除完了", "家事項目を削除しました");
            } catch (error) {
              console.error("Error deleting chore:", error);
              Alert.alert("エラー", "削除に失敗しました");
            }
          }
        }
      ]
    );
  };

  const renderChoreItem = ({ item }: { item: Chore }) => (
    <Card className="mb-3 p-4">
      <View className="flex-row items-center justify-between">
        <View className="flex-1">
          <View className="flex-row items-center mb-1">
            <Text className="text-base font-semibold text-gray-900 dark:text-white">
              {item.name}
            </Text>
          </View>
          <Text className="text-sm text-gray-600 dark:text-gray-400">
            ¥{item.reward_amount?.toLocaleString() || 0}
          </Text>
        </View>

        <View className="flex-row space-x-2">
          {/* 編集 */}
          <TouchableOpacity
            onPress={() => router.push(`/(app)/chores/new?editId=${item.id}`)}
            className="w-10 h-10 bg-blue-200 dark:bg-blue-700 rounded-full items-center justify-center"
          >
            <Ionicons name="pencil" size={20} color="#2563EB" />
          </TouchableOpacity>

          {/* 削除 */}
          <TouchableOpacity
            onPress={() => handleDeleteChore(item.id, item.name)}
            className="w-10 h-10 bg-red-200 dark:bg-red-700 rounded-full items-center justify-center"
          >
            <Ionicons name="trash" size={20} color="#DC2626" />
          </TouchableOpacity>
        </View>
      </View>
    </Card>
  );

  if (isLoading) {
    return (
      <View className="flex-1 bg-gray-50 dark:bg-gray-900 items-center justify-center">
        <ActivityIndicator size="large" color="#EC4899" />
        <Text className="text-gray-600 dark:text-gray-400 mt-4">読み込み中...</Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-gray-50 dark:bg-gray-900">
      {/* ヘッダー */}
      <View className="bg-usako-primary dark:bg-pink-600 px-5 pt-12 pb-6">
        <View className="flex-row items-center justify-between">
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color="white" />
          </TouchableOpacity>
          <Text className="text-xl font-bold text-white">
            家事項目管理
          </Text>
          <View className="w-6" />
        </View>
      </View>

      <View className="flex-1 px-5 py-6">
        {/* 説明 */}
        <View className="mb-6 p-4 bg-pink-50 dark:bg-pink-900/20 rounded-lg">
          <View className="flex-row items-start">
            <UsakoIcon size="medium" style={{ marginRight: 12, marginTop: 2 }} />
            <View className="flex-1">
              <Text className="text-sm text-gray-700 dark:text-gray-300">
                家事項目を追加・編集できますうさ〜
                報酬額も自由に設定してくださいうさ〜
              </Text>
            </View>
          </View>
        </View>

        {/* 家事項目リスト */}
        {chores.length === 0 ? (
          <View className="flex-1 items-center justify-center">
            <Text className="text-6xl mb-4">📝</Text>
            <Text className="text-gray-600 dark:text-gray-400 text-center mb-6">
              まだ家事項目がありません
              {"\n"}
              最初の家事項目を追加しましょう
            </Text>
            <Button onPress={() => router.push("/(app)/chores/new")}>
              <Text className="text-white font-semibold text-center">
                家事項目を追加
              </Text>
            </Button>
          </View>
        ) : (
          <>
            <FlatList
              data={chores}
              renderItem={renderChoreItem}
              keyExtractor={item => item.id}
              showsVerticalScrollIndicator={false}
            />

            {/* 追加ボタン */}
            <Button
              onPress={() => router.push("/(app)/chores/new")}
              className="mt-4"
            >
              <Text className="text-white font-semibold text-center">
                新しい家事項目を追加
              </Text>
            </Button>
          </>
        )}
      </View>
    </View>
  );
}
