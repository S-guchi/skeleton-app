import { Card } from "@/components/ui/Card";
import { Avatar } from "@/components/ui/Avatar";
import { COLORS } from "@/lib/constants";
import { useUser } from "@/lib/contexts/UserContext";
import { useChoreLogs, useDeleteChoreLog } from "@/lib/hooks/useChoreOperations";
// import type { ChoreLogWithUser } from "@/lib/types";
import { formatDateTimeLocalized } from "@/lib/utils/dateUtils";
import { Ionicons } from "@expo/vector-icons";
import { useMemo, useState } from "react";
import { ActivityIndicator, Alert, FlatList, Text, TouchableOpacity, View } from "react-native";
import { UsakoIcon } from "@/components/ui/UsakoIcon";

export default function HistoryScreen() {
  const { user } = useUser();
  const [selectedMonth, setSelectedMonth] = useState(new Date());
  const [showAllMembers, setShowAllMembers] = useState(true);

  const { data: allChoreLogs = [], isLoading } = useChoreLogs(selectedMonth);
  const deleteChoreLogMutation = useDeleteChoreLog();

  // フィルタリングされた家事ログ
  const choreLogs = useMemo(() => {
    if (showAllMembers) {
      return allChoreLogs;
    }
    return allChoreLogs.filter(log => log.performed_by === user?.id);
  }, [allChoreLogs, showAllMembers, user?.id]);

  const changeMonth = (direction: 'prev' | 'next') => {
    const newMonth = new Date(selectedMonth);
    if (direction === 'prev') {
      newMonth.setMonth(newMonth.getMonth() - 1);
    } else {
      newMonth.setMonth(newMonth.getMonth() + 1);
    }
    setSelectedMonth(newMonth);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return formatDateTimeLocalized(date); // デバイスのタイムゾーンを自動使用
  };

  const handleDeleteChoreLog = (logId: string, choreName: string) => {
    Alert.alert(
      '記録を削除',
      `「${choreName}」の記録を削除しますか？\n削除すると元に戻せません。`,
      [
        {
          text: 'キャンセル',
          style: 'cancel',
        },
        {
          text: '削除',
          style: 'destructive',
          onPress: () => {
            deleteChoreLogMutation.mutate(logId, {
              onError: (error: any) => {
                Alert.alert('エラー', `削除に失敗しました: ${error.message}`);
              },
            });
          },
        },
      ]
    );
  };

  const renderChoreLog = ({ item }: { item: any }) => (
    <Card className="mb-3 p-4">
      <View className="flex-row items-start justify-between">
        <View className="flex-1">
          <View className="flex-row items-center mb-1">
            <Text className="text-base font-semibold text-gray-900 dark:text-white mr-2">
              {item.chore?.name}
            </Text>
            <Text className="text-sm text-blue-600 dark:text-blue-400">
              ¥{item.chore?.reward_amount?.toLocaleString() || 0}
            </Text>
          </View>
          <View className="flex-row items-center">
            <Avatar 
              src={item.user.avatarUrl} 
              name={item.user.name} 
              size="sm" 
              className="mr-1"
            />
            <Text className="text-sm text-gray-600 dark:text-gray-400 ml-1">
              {item.user.name}
            </Text>
            <Text className="text-sm text-gray-500 dark:text-gray-500 ml-3">
              {formatDate(item.performed_at.toString())}
            </Text>
          </View>
          {item.note && (
            <Text className="text-sm text-gray-600 dark:text-gray-400 mt-2">
              📝 {item.note}
            </Text>
          )}
        </View>
        {/* 自分の記録の場合のみ削除ボタンを表示 */}
        {item.performed_by === user?.id && (
          <TouchableOpacity
            onPress={() => handleDeleteChoreLog(item.id, item.chore?.name || '不明な家事')}
            disabled={deleteChoreLogMutation.isPending}
            className="ml-3 p-2"
          >
            <Ionicons 
              name="trash-outline" 
              size={20} 
              color={deleteChoreLogMutation.isPending ? COLORS.GRAY_300 : COLORS.GRAY_500} 
            />
          </TouchableOpacity>
        )}
      </View>
    </Card>
  );

  // 集計データ
  const { totalAmount, totalCount } = useMemo(() => {
    const amount = choreLogs.reduce((sum, log) => sum + (log.chore?.reward_amount || 0), 0);
    const count = choreLogs.length;
    return { totalAmount: amount, totalCount: count };
  }, [choreLogs]);

  return (
    <View className="flex-1 bg-gray-50 dark:bg-gray-900">
      {/* ヘッダー */}
      <View className="bg-white dark:bg-gray-800 px-5 py-4 border-b border-gray-200 dark:border-gray-700">
        {/* 月選択 */}
        <View className="flex-row items-center justify-between mb-4">
          <TouchableOpacity onPress={() => changeMonth('prev')} className="p-2">
            <Ionicons name="chevron-back" size={24} color={COLORS.GRAY_500} />
          </TouchableOpacity>
          <Text className="text-lg font-semibold text-gray-900 dark:text-white">
            {selectedMonth.getFullYear()}年{selectedMonth.getMonth() + 1}月
          </Text>
          <TouchableOpacity
            onPress={() => changeMonth('next')}
            className="p-2"
            disabled={selectedMonth >= new Date()}
          >
            <Ionicons
              name="chevron-forward"
              size={24}
              color={selectedMonth >= new Date() ? COLORS.DISABLED : COLORS.GRAY_500}
            />
          </TouchableOpacity>
        </View>

        {/* フィルター */}
        <View className="flex-row items-center justify-between">
          <TouchableOpacity
            onPress={() => setShowAllMembers(!showAllMembers)}
            className="flex-row items-center"
          >
            <View className={`w-5 h-5 rounded border mr-2 items-center justify-center ${showAllMembers
                ? 'bg-usako-primary border-pink-500'
                : 'border-gray-300 dark:border-gray-600'
              }`}>
              {showAllMembers && (
                <Ionicons name="checkmark" size={14} color="white" />
              )}
            </View>
            <Text className="text-sm text-gray-700 dark:text-gray-300">
              全メンバーの記録を表示
            </Text>
          </TouchableOpacity>

          {/* 集計 */}
          <View className="items-end">
            <Text className="text-sm text-gray-600 dark:text-gray-400">
              合計: ¥{totalAmount.toLocaleString()}
            </Text>
            <Text className="text-xs text-gray-500 dark:text-gray-500">
              {totalCount}件
            </Text>
          </View>
        </View>
      </View>

      {/* リスト */}
      {isLoading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color={COLORS.PRIMARY} />
          <Text className="text-gray-600 dark:text-gray-400 mt-4">読み込み中...</Text>
        </View>
      ) : choreLogs.length === 0 ? (
        <View className="flex-1 items-center justify-center px-8">
          <UsakoIcon size="xlarge" style={{ marginBottom: 16 }} />
          <Text className="text-gray-600 dark:text-gray-400 text-center">
            この期間の家事記録はまだありませんうさ〜
          </Text>
        </View>
      ) : (
        <FlatList
          data={choreLogs}
          renderItem={renderChoreLog}
          keyExtractor={item => item.id}
          contentContainerStyle={{ padding: 20 }}
        />
      )}
    </View>
  );
}
