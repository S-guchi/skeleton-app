import React, { useState } from 'react';
import { View, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { Image } from 'expo-image';
import { User } from 'lucide-react-native';
import { avatarService } from '../../lib/services/avatarService';

interface AvatarPickerProps {
  userId: string;
  currentAvatarUrl?: string;
  onUpdate: (newAvatarUrl: string) => void;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

const sizeMap = {
  sm: 40,
  md: 56,
  lg: 80,
  xl: 120,
};

export default function AvatarPicker({
  userId,
  currentAvatarUrl,
  onUpdate,
  size = 'xl',
}: AvatarPickerProps) {
  const [isLoading, setIsLoading] = useState(false);
  const avatarSize = sizeMap[size];


  const handleUpdateAvatar = async () => {
    if (isLoading) return;

    try {
      setIsLoading(true);
      const newAvatarUrl = await avatarService.updateUserAvatarFlow(
        userId,
        currentAvatarUrl
      );
      onUpdate(newAvatarUrl);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      
      // 画像選択キャンセルの場合はアラートを表示しない
      if (errorMessage === 'No image selected') {
        return;
      }

      Alert.alert(
        'エラー',
        `アイコンの更新に失敗しました。もう一度お試しください。\n\nエラー詳細: ${errorMessage}`,
        [{ text: 'OK' }]
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <TouchableOpacity
      testID="avatar-picker-button"
      onPress={handleUpdateAvatar}
      disabled={isLoading}
      className="relative"
      style={{ width: avatarSize, height: avatarSize }}
    >
      <View
        className="rounded-full bg-gray-200 items-center justify-center overflow-hidden border-2 border-gray-300"
        style={{ width: avatarSize, height: avatarSize }}
      >
        {currentAvatarUrl ? (
          <Image
            testID="avatar-display"
            source={{ uri: currentAvatarUrl }}
            style={{ 
              width: avatarSize, 
              height: avatarSize,
              borderRadius: avatarSize / 2
            }}
            contentFit="cover"
          />
        ) : (
          <User
            testID="default-avatar-icon"
            size={avatarSize * 0.5}
            color="#9CA3AF"
          />
        )}
      </View>

      {isLoading && (
        <View
          testID="loading-indicator"
          className="absolute inset-0 bg-black bg-opacity-50 rounded-full items-center justify-center"
        >
          <ActivityIndicator size="small" color="#ffffff" />
        </View>
      )}

      {/* 編集アイコン */}
      <View className="absolute -bottom-1 -right-1 bg-blue-500 rounded-full p-1">
        <User size={12} color="#ffffff" />
      </View>
    </TouchableOpacity>
  );
}