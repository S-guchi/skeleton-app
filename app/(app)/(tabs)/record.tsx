import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { CelebrationModal } from "@/components/ui/CelebrationModal";
import { COLORS } from "@/lib/constants";
import { useActiveChores, useCreateMultipleChoreLogsMutation } from "@/lib/hooks/useChoreOperations";
import { useLocalization } from "@/lib/hooks/useLocalization";
import { Ionicons } from "@expo/vector-icons";
import { useQueryClient } from "@tanstack/react-query";
import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import { Alert, Image, KeyboardAvoidingView, Platform, ScrollView, Text, TextInput, TouchableOpacity, View } from "react-native";

export default function RecordScreen() {
  const { t, formatCurrency } = useLocalization();
  const { choreId } = useLocalSearchParams();
  const { data: chores = [] } = useActiveChores();
  const recordMultipleChoreMutation = useCreateMultipleChoreLogsMutation();
  const queryClient = useQueryClient();

  const [selectedChores, setSelectedChores] = useState<string[]>([]);
  const [note, setNote] = useState("");
  const [showCelebration, setShowCelebration] = useState(false);
  const [celebrationData, setCelebrationData] = useState({ count: 0, names: [] as string[] });

  useEffect(() => {
    if (choreId && typeof choreId === 'string') {
      setSelectedChores([choreId]);
    }
  }, [choreId]);

  const toggleChoreSelection = (choreId: string) => {
    setSelectedChores(prev =>
      prev.includes(choreId)
        ? prev.filter(id => id !== choreId)
        : [...prev, choreId]
    );
  };


  const handleRecordChore = async () => {
    if (selectedChores.length === 0) return;

    try {
      const choreData = selectedChores.map(choreId => {
        const chore = chores.find(c => c.id === choreId);
        return {
          choreId,
          rewardAmount: chore?.reward_amount || 0,
          note: note.trim() || undefined,
        };
      });

      await recordMultipleChoreMutation.mutateAsync(choreData);

      // 完了した家事の名前を取得
      const completedChoreNames = selectedChores.map(choreId => {
        const chore = chores.find(c => c.id === choreId);
        return chore?.name || '';
      }).filter(name => name);

      // お祝いモーダルのデータを設定
      setCelebrationData({
        count: selectedChores.length,
        names: completedChoreNames
      });

      // モーダルを表示
      setShowCelebration(true);

      // 選択をリセット
      setSelectedChores([]);
      setNote("");
    } catch (error) {
      console.error("Error recording multiple chores:", error);
      Alert.alert(t('common.error'), t('errors.tryAgain'));
    }
  };

  const handleCelebrationClose = () => {
    setShowCelebration(false);

    // 手動でデータを再読み込み（念のため）
    queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    queryClient.invalidateQueries({
      predicate: (query) => {
        const key = query.queryKey;
        return Array.isArray(key) && key[0] === 'settlements';
      }
    });
    queryClient.invalidateQueries({
      predicate: (query) => {
        const key = query.queryKey;
        return Array.isArray(key) && key[0] === 'chores' && key[1] === 'logs';
      }
    });

    // ホーム画面に遷移
    router.push("/(app)/(tabs)");
  };

  const getTotalReward = () => {
    return selectedChores.reduce((total, choreId) => {
      const chore = chores.find(c => c.id === choreId);
      return total + (chore?.reward_amount || 0);
    }, 0);
  };

  const isChoreSelected = (choreId: string) => {
    return selectedChores.includes(choreId);
  };

  const canRecord = selectedChores.length > 0;
  const isRecording = recordMultipleChoreMutation.isPending;

  return (
    <KeyboardAvoidingView 
      className="flex-1 bg-gray-50 dark:bg-gray-900"
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 100 : 0}
    >
      <ScrollView 
        className="flex-1"
        contentContainerStyle={{ flexGrow: 1 }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View className="px-5 py-6">
        {/* うさこのメッセージ */}
        <View className="mb-6 p-4 bg-usako-accent1 dark:bg-usako-primary/20 rounded-lg">
          <View className="flex-row items-start">
            <Image
              source={require('@/assets/images/usako/usako_kyukei.png')}
              style={{
                width: 48,
                height: 48,
                marginRight: 12,
                borderRadius: 8,
              }}
              resizeMode="contain"
            />
            <View className="flex-1">
              <Text className="text-base font-semibold text-gray-700 dark:text-gray-300 mb-1">
                {t('record.choreGreeting')}
              </Text>
              <Text className="text-sm text-gray-600 dark:text-gray-400">
                {t('record.choreQuestionMultiple')}
              </Text>
            </View>
          </View>
        </View>

        {/* 選択情報表示 */}
        <View className="mb-4 p-3 bg-usako-accent2-light dark:bg-usako-accent2/20 rounded-lg border border-usako-accent2">
          <Text className="text-sm font-bold text-gray-800 dark:text-white mb-2">
            {t('record.selectedChores', { count: selectedChores.length })}
          </Text>
          {selectedChores.length > 0 && (
            <Text className="text-sm font-semibold text-gray-700 dark:text-gray-200">
              {t('record.totalAmount', { amount: formatCurrency(getTotalReward()) })}
            </Text>
          )}
        </View>

        {/* 家事選択 */}
        <View className="mb-6">
          <View className="space-y-3">
            {chores.map((chore) => (
              <TouchableOpacity
                key={chore.id}
                onPress={() => toggleChoreSelection(chore.id)}
              >
                <Card className={`p-4 ${isChoreSelected(chore.id) ? 'border-2 border-pink-500' : ''}`}>
                  <View className="flex-row items-center justify-between">
                    <View className="flex-1">
                      <Text className="text-base font-medium text-gray-900 dark:text-white">
                        {chore.name}
                      </Text>
                      <Text className="text-sm text-gray-600 dark:text-gray-400">
                        {formatCurrency(chore.reward_amount || 0)}
                      </Text>
                    </View>
                    <View className={`w-6 h-6 rounded border-2 ${isChoreSelected(chore.id)
                      ? 'bg-usako-primary border-usako-primary'
                      : 'border-gray-300 dark:border-gray-600'
                      } items-center justify-center`}>
                      {isChoreSelected(chore.id) && (
                        <Ionicons name="checkmark" size={16} color="white" />
                      )}
                    </View>
                  </View>
                </Card>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* メモ入力 */}
        <View className="mb-6">
          <Text className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            {t('record.addNote')}
          </Text>
          <View className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
            <TextInput
              placeholder={t('record.notePlaceholder')}
              placeholderTextColor={COLORS.GRAY_400}
              value={note}
              onChangeText={setNote}
              multiline
              numberOfLines={3}
              className="text-gray-900 dark:text-white min-h-[80px]"
              textAlignVertical="top"
            />
          </View>
        </View>

        {/* 記録ボタン */}
        <Button
          onPress={handleRecordChore}
          disabled={!canRecord || isRecording}
          isLoading={isRecording}
          className="mb-4"
        >
          <Text className="text-white font-semibold text-center">
            {selectedChores.length > 0
              ? t('record.recordMultiple', { count: selectedChores.length })
              : t('record.record')
            }
          </Text>
        </Button>

        {/* 家事項目の編集リンク */}
        <TouchableOpacity
          onPress={() => router.push("/(app)/chores")}
          className="py-3"
        >
          <Text className="text-center text-usako-accent2-dark dark:text-usako-accent2 text-sm font-medium underline">
            {t('record.manageChores')}
          </Text>
        </TouchableOpacity>

        {/* お祝いモーダル */}
        <CelebrationModal
          visible={showCelebration}
          onClose={handleCelebrationClose}
          choreCount={celebrationData.count}
          choreNames={celebrationData.names}
        />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
