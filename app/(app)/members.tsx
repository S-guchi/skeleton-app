import { Avatar } from "@/components/ui/Avatar";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { UsakoIcon } from "@/components/ui/UsakoIcon";
import { useUser } from "@/lib/contexts/UserContext";
import { useHouseholdDetails, useHouseholdMembers, useIsAdmin, useRemoveHouseholdMember } from "@/lib/hooks/useHouseholdData";
import type { HouseholdMemberWithUser } from "@/lib/types";
import { createInviteCode } from '@/lib/utils/inviteCodes';
import { Ionicons } from "@expo/vector-icons";
import * as Clipboard from 'expo-clipboard';
import { router } from "expo-router";
import { useState } from 'react';
import { ActivityIndicator, Alert, FlatList, Share, Text, TouchableOpacity, View } from "react-native";

export default function MembersScreen() {
  const { user } = useUser();
  const { data: members = [], isLoading } = useHouseholdMembers();
  const { data: household } = useHouseholdDetails();
  const isAdmin = useIsAdmin();
  const removeHouseholdMemberMutation = useRemoveHouseholdMember();
  const [isGeneratingInvite, setIsGeneratingInvite] = useState(false);

  const handleCreateInviteCode = async () => {
    if (!household || !user) {
      Alert.alert("エラー", "世帯情報またはユーザー情報が見つかりません");
      return;
    }

    setIsGeneratingInvite(true);

    try {
      // 招待コードを生成（24時間有効）
      const result = await createInviteCode(household.id, user.id, 24);

      if (!result.success || !result.inviteCode) {
        throw new Error(result.error || "招待コードの生成に失敗しました");
      }

      const inviteText = `家族グループ「${household.name}」に招待します！

招待コード: ${result.inviteCode.code}

（24時間有効）

うさこの家事ノートをダウンロードして、招待コードで参加してくださいうさ〜`;

      // 共有オプションを表示
      Alert.alert(
        "招待コード生成完了",
        `招待コード: ${result.inviteCode.code}\n\n24時間以内に使用してください`,
        [
          {
            text: "コピー",
            onPress: async () => {
              try {
                await Clipboard.setStringAsync(result.inviteCode!.code);
                Alert.alert("コピー完了", "招待コードをクリップボードにコピーしました");
              } catch (error) {
                console.error("Clipboard error:", error);
                Alert.alert("エラー", "コピーに失敗しました");
              }
            }
          },
          {
            text: "共有",
            onPress: async () => {
              try {
                await Share.share({
                  message: inviteText,
                  title: "家族グループ招待",
                });
              } catch (error) {
                console.error("Share error:", error);
              }
            }
          },
          { text: "閉じる" }
        ]
      );
    } catch (error) {
      console.error("Error creating invite code:", error);
      Alert.alert("エラー", error instanceof Error ? error.message : "招待コードの生成に失敗しました");
    } finally {
      setIsGeneratingInvite(false);
    }
  };

  const handleRemoveMember = (memberId: string, memberName: string) => {
    if (!isAdmin) {
      Alert.alert("権限がありません", "管理者のみがメンバーを削除できます");
      return;
    }

    Alert.alert(
      "メンバー削除",
      `${memberName}さんを世帯から削除してもよろしいですか？`,
      [
        { text: "キャンセル", style: "cancel" },
        {
          text: "削除",
          style: "destructive",
          onPress: async () => {
            try {
              await removeHouseholdMemberMutation.mutateAsync(memberId);
              Alert.alert("削除完了", "メンバーを削除しました");
            } catch (error) {
              console.error("Error removing member:", error);
              Alert.alert("エラー", "メンバーの削除に失敗しました");
            }
          }
        }
      ]
    );
  };

  const renderMemberItem = ({ item }: { item: HouseholdMemberWithUser }) => (
    <Card className="mb-3 p-4">
      <View className="flex-row items-center justify-between">
        <View className="flex-row items-center flex-1">
          <Avatar
            src={item.user.avatar_url}
            name={item.user.name}
            size="md"
            className="mr-3"
          />
          <View className="flex-1">
            <View className="flex-row items-center mb-1">
              <Text className="text-base font-semibold text-gray-900 dark:text-white mr-2">
                {item.user.name}
              </Text>
              {item.role === 'admin' && (
                <View className="px-2 py-1 bg-pink-100 dark:bg-pink-900 rounded">
                  <Text className="text-xs text-pink-700 dark:text-pink-300">
                    管理者
                  </Text>
                </View>
              )}
              {item.userId === user?.id && (
                <View className="ml-2 px-2 py-1 bg-blue-100 dark:bg-blue-900 rounded">
                  <Text className="text-xs text-blue-700 dark:text-blue-300">
                    あなた
                  </Text>
                </View>
              )}
            </View>
            <Text className="text-sm text-gray-600 dark:text-gray-400">
              参加日: {new Date(item.joinedAt).toLocaleDateString()}
            </Text>
          </View>
        </View>

        {isAdmin && item.userId !== user?.id && (
          <TouchableOpacity
            onPress={() => handleRemoveMember(item.id, item.user.name)}
            className="w-10 h-10 bg-red-200 dark:bg-red-700 rounded-full items-center justify-center"
          >
            <Ionicons name="person-remove" size={20} color="#DC2626" />
          </TouchableOpacity>
        )}
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
            メンバー管理
          </Text>
          <View className="w-6" />
        </View>
      </View>

      <View className="flex-1 px-5 py-6">
        {/* 管理者向けメッセージ */}
        {isAdmin && (
          <View className="mb-6 p-4 bg-pink-50 dark:bg-pink-900/20 rounded-lg">
            <View className="flex-row items-start">
              <UsakoIcon size="medium" style={{ marginRight: 12, marginTop: 2 }} />
              <View className="flex-1">
                <Text className="text-sm text-gray-700 dark:text-gray-300">
                  あなたは管理者ですうさ〜
                  新しいメンバーを招待したり、メンバーを削除できますうさ〜
                </Text>
              </View>
            </View>
          </View>
        )}

        {/* メンバーリスト */}
        <View className="flex-1 mb-6">
          <Text className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            メンバー一覧 ({members.length}名)
          </Text>
          <FlatList
            data={members}
            renderItem={renderMemberItem}
            keyExtractor={item => item.id}
            style={{ flexGrow: 1 }}
          />
        </View>

        {/* 招待ボタン */}
        {isAdmin && (
          <Button
            onPress={handleCreateInviteCode}
            disabled={isGeneratingInvite}
          >
            <Text className="text-white font-semibold text-center">
              {isGeneratingInvite ? "招待コード生成中..." : "新しいメンバーを招待"}
            </Text>
          </Button>
        )}

        {!isAdmin && (
          <View className="items-center p-4">
            <Text className="text-gray-600 dark:text-gray-400 text-center">
              新しいメンバーの招待は管理者が行えます
            </Text>
          </View>
        )}
      </View>
    </View>
  );
}
